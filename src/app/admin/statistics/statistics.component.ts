import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  private filterChange = new Subject<void>();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.filterChange.pipe(debounceTime(300)).subscribe(() => {
      this.onFilterChange();
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
  }

  // Hàm định dạng ngày thành YYYY-MM-DD
  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'san-pham') {
      this.loadBestSellingProducts(this.currentPage);
    }
  }

  onTimeTypeChange(): void {
    this.resetFilters();
    this.updateChartTypes();
    this.updateChartLabels();
    this.filterChange.next();
  }

  onFilterChange(): void {
    if (this.validateFilters()) {
      this.errorMessage = null;
      this.currentPage = 0;
      this.loadDataForSelectedTimeType();
    } else {
      this.errorMessage = 'Vui lòng nhập đầy đủ và đúng thông tin bộ lọc (ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc).';
      this.bestSellingProducts = [];
      this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
      this.cdr.detectChanges();
    }
  }

  validateFilters(): boolean {
    const today = new Date();
    if (this.selectedTimeType === 'ngay') {
      if (!this.startDate || !this.endDate) return false;
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return start <= end && start <= today && end <= today;
    }
    if (this.selectedTimeType === 'tuan') {
      return !!this.selectedYear && !!this.selectedWeek && parseInt(this.selectedWeek) >= 1 && parseInt(this.selectedWeek) <= 52;
    }
    if (this.selectedTimeType === 'thang') {
      return !!this.selectedYear && !!this.selectedMonth && parseInt(this.selectedMonth) >= 1 && parseInt(this.selectedMonth) <= 12;
    }
    if (this.selectedTimeType === 'nam') {
      return !!this.selectedYear && parseInt(this.selectedYear) <= today.getFullYear();
    }
    return false;
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
    this.selectedMonth = (new Date().getMonth() + 1).toString();
    this.selectedYear = new Date().getFullYear().toString();
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((today.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.startDate = this.formatDate(yesterday);
    this.endDate = this.formatDate(today);
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
      this.errorMessage = 'Bộ lọc không hợp lệ cho tổng quan.';
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/tong-quan/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/tong-quan/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/tong-quan/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/tong-quan/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<ThongKeDonHangDTO>(url).subscribe({
      next: (data) => {
        this.thongKeTongQuanFiltered = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải tổng quan theo bộ lọc.';
        this.cdr.detectChanges();
      }
    });
  }

  loadBestSellingProducts(page: number = 0): void {
    if (!this.validateFilters()) {
      this.errorMessage = 'Bộ lọc không hợp lệ cho sản phẩm bán chạy.';
      this.bestSellingProducts = [];
      this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
      this.cdr.detectChanges();
      return;
    }

    this.currentPage = page;
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/best-selling/ngay?startDate=${this.formatDate(this.startDate)}&endDate=${this.formatDate(this.endDate)}&page=${page}&size=${this.pageSize}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/best-selling/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}&page=${page}&size=${this.pageSize}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/best-selling/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}&page=${page}&size=${this.pageSize}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/best-selling/nam?year=${this.selectedYear}&page=${page}&size=${this.pageSize}`;
        break;
    }

    console.log('Gửi request API:', url); // Log URL để debug

    this.http.get<Page<BestSellingProductDTO>>(url).subscribe({
      next: (data) => {
        console.log('Dữ liệu sản phẩm bán chạy:', data); // Log dữ liệu trả về
        this.bestSellingProductsPage = data;
        this.bestSellingProducts = data.content || [];
        this.currentPage = data.page.number;
        this.errorMessage = this.bestSellingProducts.length === 0 ? 'Không có sản phẩm bán chạy trong khoảng thời gian này.' : null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm bán chạy:', err); // Log lỗi
        this.errorMessage = err.status === 400 ? 'Dữ liệu bộ lọc không hợp lệ. Vui lòng kiểm tra lại.' : 'Lỗi khi tải dữ liệu sản phẩm bán chạy.';
        this.bestSellingProducts = [];
        this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
        this.cdr.detectChanges();
      }
    });
  }

  loadDataForSelectedTimeType(): void {
    if (!this.validateFilters()) {
      this.errorMessage = 'Bộ lọc không hợp lệ, vui lòng kiểm tra lại.';
      this.bestSellingProducts = [];
      this.bestSellingProductsPage = { content: [], page: { totalPages: 0, totalElements: 0, number: 0, size: this.pageSize } };
      this.cdr.detectChanges();
      return;
    }

    this.currentPage = 0;
    this.loadThongKeTongQuan();
    this.loadBestSellingProducts(this.currentPage);
    this.loadDoanhThu();
    this.loadSoLuongDon();
    if (this.compareYear) {
      this.loadCompareDoanhThu();
    }
  }

  loadDoanhThu(): void {
    if (!this.validateFilters()) {
      this.errorMessage = 'Bộ lọc không hợp lệ cho doanh thu.';
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url).subscribe({
      next: (data) => {
        this.doanhThuData = data;
        this.updateDoanhThuChart();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải dữ liệu doanh thu.';
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
      { data: this.doanhThuData.map(item => item.tongDoanhThu), label: `Tổng doanh thu (${this.selectedYear})`, backgroundColor: '#FF6384', borderColor: '#FF6384', fill: false },
      { data: this.doanhThuData.map(item => item.doanhThuOnline), label: `Doanh thu online (${this.selectedYear})`, backgroundColor: '#36A2EB', borderColor: '#36A2EB', fill: false },
      { data: this.doanhThuData.map(item => item.doanhThuOffline), label: `Doanh thu offline (${this.selectedYear})`, backgroundColor: '#FFCE56', borderColor: '#FFCE56', fill: false }
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
      this.errorMessage = 'Bộ lọc không hợp lệ cho số lượng đơn.';
      this.cdr.detectChanges();
      return;
    }

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/tuan?year=${this.selectedYear}&week=${parseInt(this.selectedWeek)}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/thang?year=${this.selectedYear}&month=${parseInt(this.selectedMonth)}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/nam?year=${this.selectedYear}`;
        break;
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
        this.errorMessage = 'Không thể tải dữ liệu số lượng đơn.';
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
    const maxButtons = 5;
    const range: { page: number; isEllipsis: boolean }[] = [];
    const halfMaxButtons = Math.floor(maxButtons / 2);

    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) {
        range.push({ page: i, isEllipsis: false });
      }
    } else {
      let startPage = Math.max(0, this.currentPage - halfMaxButtons);
      let endPage = Math.min(totalPages, startPage + maxButtons);

      if (endPage - startPage < maxButtons) {
        startPage = Math.max(0, endPage - maxButtons);
      }

      if (startPage > 0) {
        range.push({ page: 0, isEllipsis: false });
        if (startPage > 1) {
          range.push({ page: -1, isEllipsis: true });
        }
      }

      for (let i = startPage; i < endPage; i++) {
        range.push({ page: i, isEllipsis: false });
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          range.push({ page: -1, isEllipsis: true });
        }
        range.push({ page: totalPages - 1, isEllipsis: false });
      }
    }

    return range;
  }
}