import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Giao diện dữ liệu
interface ThongKeDonHangDTO {
  tongDoanhThu: number;
  doanhThuOnline: number;
  doanhThuOffline: number;
  onlineHoanThanh: number;
  onlineHuy: number;
  offlineHoanThanh: number;
  offlineHuy: number;
  soLuongDon: number;
  soLuongDonOnline: number;
  soLuongDonOffline: number;
  tiLeTangTruongDoanhThu: number | null;
}

interface ThongKeTheoThoiGianDTO {
  thoiGian: string;
  tongDoanhThu: number;
  doanhThuOnline: number;
  doanhThuOffline: number;
  onlineHoanThanh: number;
  onlineHuy: number;
  offlineHoanThanh: number;
  offlineHuy: number;
  soLuongDon: number;
  tiLeTangTruongDoanhThu: number | null;
}

interface SoLuongDonHangDTO {
  thoiGian: string;
  soLuongDon: number;
}

interface BestSellingProductDTO {
  idSanPham: number;
  tenSanPham: string;
  moTaSanPham: string;
  thuongHieu: string;
  nhomHuong: string;
  danhMuc: string;
  huongDau: string;
  huongGiua: string;
  huongCuoi: string;
  stockStatus: string;
  idSpct: number;
  dungTich: number;
  soLuongTonKho: number;
  totalQuantitySold: number;
  soLuotTraHang: number;
  stockWarning: boolean;
}

interface Page<T> {
  content: T[];
  page: {
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  };
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    BaseChartDirective,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  thongKeTongQuan: ThongKeDonHangDTO | null = null;
  thongKeTongQuanFiltered: ThongKeDonHangDTO | null = null;
  bestSellingProducts: BestSellingProductDTO[] = [];
  bestSellingProductsPage: Page<BestSellingProductDTO> | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  errorMessage: string | null = null;

  searchQuery: string = '';
  sortField: string = 'totalQuantitySold';
  sortDirection: string = 'desc';
  isLoading: boolean = false;
  doanhThuData: ThongKeTheoThoiGianDTO[] = [];
  soLuongDonData: SoLuongDonHangDTO[] = [];
  compareDoanhThuData: ThongKeTheoThoiGianDTO[] = [];

  selectedTimeType: string = 'tuan';
  selectedMonth: string = (new Date().getMonth() + 1).toString();
  selectedYear: string = new Date().getFullYear().toString();
  compareYear: string | null = null;
  selectedWeek: string = '1';
  startDate: string = '';
  endDate: string = '';

  selectedTab: string = 'don-hang-doanh-thu';

  months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Tháng ${i + 1}`
  }));
  years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  weeks = Array.from({ length: 52 }, (_, i) => (i + 1).toString());

  doanhThuConfig: ChartConfiguration['data'] = { datasets: [], labels: [] };
  doanhThuOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { display: true, title: { display: true, text: 'Thời gian' } },
      y: { display: true, title: { display: true, text: 'Doanh thu (VNĐ)' } }
    },
    datasets: { bar: { maxBarThickness: 130 } }
  };
  doanhThuType: ChartType = 'bar';

  soLuongDonConfig: ChartConfiguration['data'] = { datasets: [], labels: [] };
  soLuongDonOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { display: true, title: { display: true, text: 'Thời gian' } },
      y: { display: true, title: { display: true, text: 'Số lượng đơn' } }
    },
    datasets: { bar: { barThickness: 120, maxBarThickness: 120 } }
  };
  soLuongDonType: ChartType = 'bar';

  public filterChange = new Subject<void>();
  public searchChange = new Subject<void>();

  expandedCells: boolean[][] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.filterChange.pipe(debounceTime(300)).subscribe(() => {
      this.onFilterChange();
    });
    this.searchChange.pipe(debounceTime(500)).subscribe(() => {
      this.onSearchChange();
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((today.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.startDate = this.formatDate(yesterday);
    this.endDate = this.formatDate(today);

    this.updateChartTypes();
    this.updateChartLabels();
    this.loadDataForSelectedTimeType();
    this.initializeExpandedCells();
  }

  private initializeExpandedCells(): void {
    this.expandedCells = this.bestSellingProducts.map(() => new Array(12).fill(false));
  }

  toggleFullContent(rowIndex: number, colIndex: number): void {
    this.expandedCells[rowIndex] = this.expandedCells[rowIndex].map((_, i) => i === colIndex ? !this.expandedCells[rowIndex][i] : false);
    this.cdr.detectChanges();
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'san-pham') {
      this.loadBestSellingProducts(this.currentPage);
      this.initializeExpandedCells();
    }
  }

  onTimeTypeChange(): void {
    this.resetFilters();
    this.searchQuery = '';
    this.sortField = 'totalQuantitySold';
    this.sortDirection = 'desc';
    this.updateChartTypes();
    this.updateChartLabels();
    this.filterChange.next();
  }

  onFilterChange(): void {
    if (this.validateFilters() || !this.isTimeFilterApplied()) {
      this.errorMessage = null;
      this.currentPage = 0;
      this.loadDataForSelectedTimeType();
      this.initializeExpandedCells();
    } else {
      this.errorMessage = 'Vui lòng nhập đầy đủ và đúng thông tin bộ lọc (ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc).';
      this.bestSellingProducts = [];
      this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
      this.cdr.detectChanges();
    }
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadBestSellingProducts(this.currentPage);
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadBestSellingProducts(this.currentPage);
  }

  validateFilters(): boolean {
    const today = new Date();
    if (this.selectedTimeType === 'ngay') {
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        return start <= end && start <= today && end <= today;
      }
      return true;
    }
    if (this.selectedTimeType === 'tuan') {
      if (this.selectedYear && this.selectedWeek) {
        return parseInt(this.selectedWeek) >= 1 && parseInt(this.selectedWeek) <= 52;
      }
      return true;
    }
    if (this.selectedTimeType === 'thang') {
      if (this.selectedYear && this.selectedMonth) {
        return parseInt(this.selectedMonth) >= 1 && parseInt(this.selectedMonth) <= 12;
      }
      return true;
    }
    if (this.selectedTimeType === 'nam') {
      if (this.selectedYear) {
        return parseInt(this.selectedYear) <= today.getFullYear();
      }
      return true;
    }
    return false;
  }

  isTimeFilterApplied(): boolean {
    switch (this.selectedTimeType) {
      case 'ngay':
        return !!(this.startDate && this.endDate);
      case 'tuan':
        return !!(this.selectedYear && this.selectedWeek);
      case 'thang':
        return !!(this.selectedYear && this.selectedMonth);
      case 'nam':
        return !!this.selectedYear;
      default:
        return false;
    }
  }

  getTimeLabel(): string {
    switch (this.selectedTimeType) {
      case 'ngay': return 'Ngày';
      case 'tuan': return 'Tuần';
      case 'thang': return 'Tháng';
      case 'nam': return 'Năm';
      default: return 'Thời gian';
    }
  }

  resetFilters(): void {
    this.selectedMonth = '';
    this.selectedYear = '';
    this.selectedWeek = '';
    this.startDate = '';
    this.endDate = '';
    this.compareYear = null;
    this.compareDoanhThuData = [];
  }

  updateChartTypes(): void {
    this.doanhThuType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';
    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';
  }

  updateChartLabels(): void {
    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
  }

  loadThongKeTongQuan(): void {
    this.http.get<ThongKeDonHangDTO>('http://localhost:8080/api/thong-ke/tong-quan').subscribe({
      next: (data) => {
        this.thongKeTongQuan = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải dữ liệu tổng quan cố định.';
        this.cdr.detectChanges();
      }
    });

    this.loadThongKeTongQuanFiltered();
  }

  loadThongKeTongQuanFiltered(): void {
    if (!this.validateFilters()) {
      this.thongKeTongQuanFiltered = null;
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        if (!this.startDate || !this.endDate) return;
        url = `http://localhost:8080/api/thong-ke/tong-quan/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        if (!this.selectedYear || !this.selectedWeek) return;
        url = `http://localhost:8080/api/thong-ke/tong-quan/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        if (!this.selectedYear || !this.selectedMonth) return;
        url = `http://localhost:8080/api/thong-ke/tong-quan/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        if (!this.selectedYear) return;
        url = `http://localhost:8080/api/thong-ke/tong-quan/nam?year=${this.selectedYear}`;
        break;
      default:
        return;
    }

    this.http.get<ThongKeDonHangDTO>(url).subscribe({
      next: (data) => {
        this.thongKeTongQuanFiltered = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.thongKeTongQuanFiltered = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadBestSellingProducts(page: number = 0): void {
    this.currentPage = page;
    let url = '';
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', this.pageSize.toString())
      .set('searchQuery', this.searchQuery || '')
      .set('sortField', this.sortField)
      .set('sortDirection', this.sortDirection);
  
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/best-selling/ngay`;
        if (this.startDate && this.endDate) {
          params = params
            .set('startDate', this.startDate)
            .set('endDate', this.endDate);
        }
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/best-selling/tuan`;
        if (this.selectedYear && this.selectedWeek) {
          params = params
            .set('year', this.selectedYear)
            .set('week', this.selectedWeek);
        }
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/best-selling/thang`;
        if (this.selectedYear && this.selectedMonth) {
          params = params
            .set('year', this.selectedYear)
            .set('month', this.selectedMonth);
        }
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/best-selling/nam`;
        if (this.selectedYear) {
          params = params.set('year', this.selectedYear);
        }
        break;
    }
  
    console.log('Calling API with params:', params.toString());
    this.http.get<Page<BestSellingProductDTO>>(url, { params }).subscribe({
      next: (data) => {
        console.log('API response:', data);
        this.bestSellingProductsPage = data;
        this.bestSellingProducts = data.content || [];
        this.currentPage = data.page.number;
        if (this.bestSellingProducts.length === 0) {
          if (this.isTimeFilterApplied()) {
            this.errorMessage = 'Không có sản phẩm nào trong khoảng thời gian này.';
          } else {
            this.errorMessage = 'Không có sản phẩm nào trong cửa hàng.';
          }
        } else {
          this.errorMessage = null;
        }
        this.initializeExpandedCells();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API error:', err);
        this.errorMessage = err.status === 400 ? 'Dữ liệu bộ lọc không hợp lệ. Vui lòng kiểm tra lại.' : 'Lỗi khi tải dữ liệu sản phẩm.';
        this.bestSellingProducts = [];
        this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
        this.cdr.detectChanges();
      }
    });
  }

  loadAllBestSellingProducts(): Promise<BestSellingProductDTO[]> {
    return new Promise((resolve, reject) => {
      const allProducts: BestSellingProductDTO[] = [];
      let currentPage = 0;
      const pageSize = 10000;

      const fetchPage = (page: number) => {
        let url = '';
        let params = new HttpParams()
          .set('page', page.toString())
          .set('size', pageSize.toString())
          .set('searchQuery', this.searchQuery || '')
          .set('sortField', this.sortField)
          .set('sortDirection', this.sortDirection);

        switch (this.selectedTimeType) {
          case 'ngay':
            url = `http://localhost:8080/api/thong-ke/best-selling/ngay`;
            if (this.startDate && this.endDate) {
              params = params
                .set('startDate', this.startDate)
                .set('endDate', this.endDate);
            }
            break;
          case 'tuan':
            url = `http://localhost:8080/api/thong-ke/best-selling/tuan`;
            if (this.selectedYear && this.selectedWeek) {
              params = params
                .set('year', this.selectedYear)
                .set('week', this.selectedWeek);
            }
            break;
          case 'thang':
            url = `http://localhost:8080/api/thong-ke/best-selling/thang`;
            if (this.selectedYear && this.selectedMonth) {
              params = params
                .set('year', this.selectedYear)
                .set('month', this.selectedMonth);
            }
            break;
          case 'nam':
            url = `http://localhost:8080/api/thong-ke/best-selling/nam`;
            if (this.selectedYear) {
              params = params.set('year', this.selectedYear);
            }
            break;
        }

        this.http.get<Page<BestSellingProductDTO>>(url, { params }).subscribe({
          next: (data) => {
            if (data && data.content) {
              allProducts.push(...data.content);
              if (page + 1 < data.page.totalPages) {
                fetchPage(page + 1);
              } else {
                resolve(allProducts);
              }
            } else {
              resolve(allProducts);
            }
          },
          error: (err) => {
            this.errorMessage = 'Lỗi khi tải dữ liệu tất cả sản phẩm.';
            this.cdr.detectChanges();
            reject(err);
          }
        });
      };

      fetchPage(currentPage);
    });
  }

  loadDataForSelectedTimeType(): void {
    this.currentPage = 0;
    this.loadThongKeTongQuan();
    if (this.selectedTab === 'san-pham') {
      this.loadBestSellingProducts(this.currentPage);
    }
    this.loadDoanhThu();
    this.loadSoLuongDon();
    if (this.compareYear) {
      this.loadCompareDoanhThu();
    }
  }

  loadDoanhThu(): void {
    if (!this.validateFilters()) {
      this.doanhThuData = [];
      this.updateDoanhThuChart();
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        if (!this.startDate || !this.endDate) return;
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        if (!this.selectedYear || !this.selectedWeek) return;
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        if (!this.selectedYear || !this.selectedMonth) return;
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        if (!this.selectedYear) return;
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.selectedYear}`;
        break;
      default:
        return;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url).subscribe({
      next: (data) => {
        this.doanhThuData = data;
        this.updateDoanhThuChart();
        this.cdr.detectChanges();
      },
      error: () => {
        this.doanhThuData = [];
        this.updateDoanhThuChart();
        this.cdr.detectChanges();
      }
    });
  }

  loadCompareDoanhThu(): void {
    if (!this.compareYear || !this.validateFilters()) {
      this.compareDoanhThuData = [];
      this.updateDoanhThuChart();
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.compareYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.compareYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.compareYear}`;
        break;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url).subscribe({
      next: (data) => {
        this.compareDoanhThuData = data;
        const hasData = data.some(item => item.tongDoanhThu > 0 || item.doanhThuOnline > 0 || item.doanhThuOffline > 0);
        if (!hasData) {
          this.compareDoanhThuData = [];
        }
        this.updateDoanhThuChart();
        this.cdr.detectChanges();
      },
      error: () => {
        this.compareDoanhThuData = [];
        this.updateDoanhThuChart();
        this.cdr.detectChanges();
      }
    });
  }

  updateDoanhThuChart(): void {
    const labels = this.doanhThuData.map(item => item.thoiGian);
    const datasets = [
      { data: this.doanhThuData.map(item => item.tongDoanhThu), label: `Tổng doanh thu (${this.selectedYear || 'Tất cả'})`, backgroundColor: '#FF6384', borderColor: '#FF6384', fill: false },
      { data: this.doanhThuData.map(item => item.doanhThuOnline), label: `Doanh thu online (${this.selectedYear || 'Tất cả'})`, backgroundColor: '#36A2EB', borderColor: '#36A2EB', fill: false },
      { data: this.doanhThuData.map(item => item.doanhThuOffline), label: `Doanh thu offline (${this.selectedYear || 'Tất cả'})`, backgroundColor: '#FFCE56', borderColor: '#FFCE56', fill: false }
    ];

    if (this.compareDoanhThuData.length > 0) {
      datasets.push(
        { data: this.compareDoanhThuData.map(item => item.tongDoanhThu), label: `Tổng doanh thu (${this.compareYear})`, backgroundColor: '#FF9999', borderColor: '#FF9999', fill: false },
        { data: this.compareDoanhThuData.map(item => item.doanhThuOnline), label: `Doanh thu online (${this.compareYear})`, backgroundColor: '#66B2FF', borderColor: '#66B2FF', fill: false },
        { data: this.compareDoanhThuData.map(item => item.doanhThuOffline), label: `Doanh thu offline (${this.compareYear})`, backgroundColor: '#FFE066', borderColor: '#FFE066', fill: false }
      );
    }

    this.doanhThuConfig = { labels, datasets };
    this.cdr.detectChanges();
  }

  loadSoLuongDon(): void {
    if (!this.validateFilters()) {
      this.soLuongDonData = [];
      this.soLuongDonConfig = { labels: [], datasets: [] };
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        if (!this.startDate || !this.endDate) return;
        url = `http://localhost:8080/api/thong-ke/so-luong-don/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        if (!this.selectedYear || !this.selectedWeek) return;
        url = `http://localhost:8080/api/thong-ke/so-luong-don/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        if (!this.selectedYear || !this.selectedMonth) return;
        url = `http://localhost:8080/api/thong-ke/so-luong-don/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        if (!this.selectedYear) return;
        url = `http://localhost:8080/api/thong-ke/so-luong-don/nam?year=${this.selectedYear}`;
        break;
      default:
        return;
    }

    this.http.get<SoLuongDonHangDTO[]>(url).subscribe({
      next: (data) => {
        this.soLuongDonData = data;
        this.soLuongDonConfig = {
          labels: data.map(item => item.thoiGian),
          datasets: [
            { data: data.map(item => item.soLuongDon), label: 'Số lượng đơn', backgroundColor: '#4BC0C0', borderColor: '#4BC0C0', fill: false }
          ]
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.soLuongDonData = [];
        this.soLuongDonConfig = { labels: [], datasets: [] };
        this.cdr.detectChanges();
      }
    });
  }

  onCompareYearChange(): void {
    this.filterChange.next();
  }

  prevPage(): void {
    if (this.bestSellingProductsPage && this.currentPage > 0) {
      this.loadBestSellingProducts(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.bestSellingProductsPage && this.currentPage < this.bestSellingProductsPage.page.totalPages - 1) {
      this.loadBestSellingProducts(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    if (this.bestSellingProductsPage && page >= 0 && page < this.bestSellingProductsPage.page.totalPages) {
      this.loadBestSellingProducts(page);
    }
  }

  getPaginationRange(): { page: number; isEllipsis: boolean }[] {
    if (!this.bestSellingProductsPage) {
      return [];
    }
    const totalPages = this.bestSellingProductsPage.page.totalPages;
    const range: { page: number; isEllipsis: boolean }[] = [];
  
    // Hiển thị tất cả các trang
    for (let i = 0; i < totalPages; i++) {
      range.push({ page: i, isEllipsis: false });
    }
  
    return range;
  }

  exportToExcelDonHangDoanhThu(): void {
    if (!this.thongKeTongQuan || !this.thongKeTongQuanFiltered || !this.doanhThuData || !this.soLuongDonData) {
      this.errorMessage = 'Không có dữ liệu để xuất Excel.';
      this.cdr.detectChanges();
      return;
    }

    const workbook = XLSX.utils.book_new();

    const tongQuanData = [
      ['Tổng quan cố định'],
      ['Tổng doanh thu', this.thongKeTongQuan.tongDoanhThu],
      ['Doanh thu online', this.thongKeTongQuan.doanhThuOnline],
      ['Doanh thu offline', this.thongKeTongQuan.doanhThuOffline],
      ['Tổng số lượng đơn', this.thongKeTongQuan.soLuongDon],
      ['Số lượng đơn online', this.thongKeTongQuan.soLuongDonOnline],
      ['Số lượng đơn offline', this.thongKeTongQuan.soLuongDonOffline],
      ['Online hoàn thành', this.thongKeTongQuan.onlineHoanThanh],
      ['Online không hoàn thành', this.thongKeTongQuan.onlineHuy],
      ['Offline hoàn thành', this.thongKeTongQuan.offlineHoanThanh],
      ['Offline hủy', this.thongKeTongQuan.offlineHuy],
      [],
    ];

    const tongQuanFilteredData = [
      ['Tổng quan theo bộ lọc'],
      ['Tổng doanh thu', this.thongKeTongQuanFiltered?.tongDoanhThu || 0],
      ['Doanh thu online', this.thongKeTongQuanFiltered?.doanhThuOnline || 0],
      ['Doanh thu offline', this.thongKeTongQuanFiltered?.doanhThuOffline || 0],
      ['Tổng số lượng đơn', this.thongKeTongQuanFiltered?.soLuongDon || 0],
      ['Số lượng đơn online', this.thongKeTongQuanFiltered?.soLuongDonOnline || 0],
      ['Số lượng đơn offline', this.thongKeTongQuanFiltered?.soLuongDonOffline || 0],
      ['Online hoàn thành', this.thongKeTongQuanFiltered?.onlineHoanThanh || 0],
      ['Online không hoàn thành', this.thongKeTongQuanFiltered?.onlineHuy || 0],
      ['Offline hoàn thành', this.thongKeTongQuanFiltered?.offlineHoanThanh || 0],
      ['Offline hủy', this.thongKeTongQuanFiltered?.offlineHuy || 0],
      [],
    ];

    const chiTietDoanhThuData = [
      ['Chi tiết doanh thu'],
      ['Thời gian', 'Tổng doanh thu', 'Doanh thu online', 'Doanh thu offline', 'Tỉ lệ tăng trưởng (%)'],
      ...this.doanhThuData.map(item => [
        item.thoiGian,
        item.tongDoanhThu,
        item.doanhThuOnline,
        item.doanhThuOffline,
        item.tiLeTangTruongDoanhThu !== null ? item.tiLeTangTruongDoanhThu : 'N/A'
      ]),
      [],
    ];

    const soLuongDonData = [
      ['Số lượng đơn'],
      ['Thời gian', 'Số lượng đơn'],
      ...this.soLuongDonData.map(item => [item.thoiGian, item.soLuongDon]),
    ];

    const sheetData = [
      ...tongQuanData,
      ...tongQuanFilteredData,
      ...chiTietDoanhThuData,
      ...soLuongDonData,
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    const colWidths = [];
    const minWidth = 15;
    const maxWidth = 60;
    const numberMultiplier = 1.5;
    const stringMultiplier = 1.2;

    for (let i = 0; i < sheetData[0].length; i++) {
      let maxWidthForCol = 0;
      for (let j = 0; j < sheetData.length; j++) {
        const cellValue = sheetData[j][i] ? sheetData[j][i].toString() : '';
        let width;

        if (!isNaN(Number(cellValue)) && cellValue !== 'N/A') {
          width = (cellValue.length * numberMultiplier) + 5;
        } else {
          width = (cellValue.length * stringMultiplier) + 2;
        }

        maxWidthForCol = Math.max(maxWidthForCol, width);
      }
      maxWidthForCol = Math.max(minWidth, Math.min(maxWidth, maxWidthForCol));
      colWidths.push({ wch: maxWidthForCol });
    }
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, ws, 'DonHang-DoanhThu');

    let fileName = 'don_hang_doanh_thu';
    switch (this.selectedTimeType) {
      case 'ngay':
        if (this.startDate && this.endDate) {
          fileName += `_${this.startDate}_den_${this.endDate}`;
        }
        break;
      case 'tuan':
        if (this.selectedYear && this.selectedWeek) {
          fileName += `_tuan${this.selectedWeek}_${this.selectedYear}`;
        }
        break;
      case 'thang':
        if (this.selectedYear && this.selectedMonth) {
          fileName += `_thang${this.selectedMonth}_${this.selectedYear}`;
        }
        break;
      case 'nam':
        if (this.selectedYear) {
          fileName += `_${this.selectedYear}`;
        }
        break;
    }

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  }
  sortColumn(field: string, direction: string): void {
    if (this.sortField !== field) {
      this.sortField = field;
      this.sortDirection = direction;
    } else if (this.sortDirection === direction) {
      this.sortDirection = direction === 'asc' ? 'desc' : 'asc'; // Đảo chiều nếu cùng hướng
    } else {
      this.sortDirection = direction;
    }
    this.currentPage = 0;
    this.loadBestSellingProducts(this.currentPage);
  }
  async exportToExcelSanPham(): Promise<void> {
    try {
      const products = await this.loadAllBestSellingProducts();
      if (!products || products.length === 0) {
        this.errorMessage = 'Không có dữ liệu sản phẩm để xuất Excel.';
        this.cdr.detectChanges();
        return;
      }

      const productData = [
        ['Sản phẩm'],
        [
          'Tên sản phẩm',
          'Thương hiệu',
          'Danh mục',
          'Nhóm hương',
          'Hương đầu',
          'Hương giữa',
          'Hương cuối',
          'Dung tích (ml)',
          'Số lượng bán',
          'Số lượt trả hàng',
          'Số lượng tồn kho',
          'Trạng thái tồn kho'
        ],
        ...products.map(product => [
          product.tenSanPham || 'N/A',
          product.thuongHieu || 'N/A',
          product.danhMuc || 'N/A',
          product.nhomHuong || 'N/A',
          product.huongDau || 'N/A',
          product.huongGiua || 'N/A',
          product.huongCuoi || 'N/A',
          product.dungTich || 0,
          product.totalQuantitySold || 0,
          product.soLuotTraHang || 0,
          product.soLuongTonKho || 0,
          product.stockStatus || (product.soLuongTonKho === 0 ? 'Hết hàng' : (product.soLuongTonKho < 5 ? 'Sắp hết hàng' : 'Còn hàng'))
        ])
      ];

      const workbook = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(productData);

      const colWidths = [];
      const minWidth = 15;
      const maxWidth = 60;
      const numberMultiplier = 1.5;
      const stringMultiplier = 1.2;

      for (let i = 0; i < productData[0].length; i++) {
        let maxWidthForCol = 0;
        for (let j = 0; j < productData.length; j++) {
          const cellValue = productData[j][i] ? productData[j][i].toString() : '';
          let width;

          if (!isNaN(Number(cellValue)) && cellValue !== 'N/A') {
            width = (cellValue.length * numberMultiplier) + 5;
          } else {
            width = (cellValue.length * stringMultiplier) + 2;
          }

          maxWidthForCol = Math.max(maxWidthForCol, width);
        }
        maxWidthForCol = Math.max(minWidth, Math.min(maxWidth, maxWidthForCol));
        colWidths.push({ wch: maxWidthForCol });
      }
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, ws, 'SanPham');

      let fileName = 'thong_ke_san_pham';
      switch (this.selectedTimeType) {
        case 'ngay':
          if (this.startDate && this.endDate) {
            fileName += `_${this.startDate}_den_${this.endDate}`;
          }
          break;
        case 'tuan':
          if (this.selectedYear && this.selectedWeek) {
            fileName += `_tuan${this.selectedWeek}_${this.selectedYear}`;
          }
          break;
        case 'thang':
          if (this.selectedYear && this.selectedMonth) {
            fileName += `_thang${this.selectedMonth}_${this.selectedYear}`;
          }
          break;
        case 'nam':
          if (this.selectedYear) {
            fileName += `_${this.selectedYear}`;
          }
          break;
      }

      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `${fileName}.xlsx`);
    } catch (error) {
      this.errorMessage = 'Lỗi khi xuất dữ liệu sản phẩm ra Excel.';
      this.cdr.detectChanges();
    }
  }
}