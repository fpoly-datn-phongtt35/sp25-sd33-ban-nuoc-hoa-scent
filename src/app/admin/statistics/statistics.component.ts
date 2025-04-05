import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';

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
  idSpct: number;
  dungTich: number;
  soLuongTonKho: number;
  stockWarning: boolean;
  totalQuantitySold: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BaseChartDirective, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  thongKeTongQuan: ThongKeDonHangDTO | null = null;
  thongKeTongQuanFiltered: ThongKeDonHangDTO | null = null;
  bestSellingProducts: BestSellingProductDTO[] = [];

  doanhThuData: ThongKeTheoThoiGianDTO[] = [];
  soLuongDonData: SoLuongDonHangDTO[] = [];
  compareDoanhThuData: ThongKeTheoThoiGianDTO[] = [];

  selectedTimeType: string = 'tuan';
  selectedMonth: string = new Date().getMonth() + 1 + '';
  selectedYear: string = new Date().getFullYear() + '';
  compareYear: string | null = null;
  selectedWeek: string = '1';
  startDate: string = '';
  endDate: string = '';

  // Tab control
  selectedTab: string = 'don-hang-doanh-thu'; // Default tab

  months = [
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' }
  ];
  years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  weeks = Array.from({ length: 52 }, (_, i) => (i + 1).toString());

  doanhThuConfig: ChartConfiguration['data'] = { datasets: [], labels: [] };
  doanhThuOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { display: true, title: { display: true, text: 'Thời gian' } as any },
      y: { display: true, title: { display: true, text: 'Doanh thu (VNĐ)' } as any }
    },
    datasets: { bar: { maxBarThickness: 130 } }
  };
  doanhThuType: ChartType = 'line';

  soLuongDonConfig: ChartConfiguration['data'] = { datasets: [], labels: [] };
  soLuongDonOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { display: true, title: { display: true, text: 'Thời gian' } as any },
      y: { display: true, title: { display: true, text: 'Số lượng đơn' } as any }
    },
    datasets: { bar: { barThickness: 120, maxBarThickness: 120 } }
  };
  soLuongDonType: ChartType = 'bar';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((today.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.startDate = yesterday.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.doanhThuType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';
    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';

    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }

    this.loadThongKeTongQuan();
    this.loadDataForSelectedTimeType();
  }

  // Switch tabs
  switchTab(tab: string): void {
    this.selectedTab = tab;
  }

  onTimeTypeChange(): void {
    this.selectedMonth = new Date().getMonth() + 1 + '';
    this.selectedYear = new Date().getFullYear() + '';
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((today.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.startDate = yesterday.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.compareYear = null;
    this.compareDoanhThuData = [];

    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }

    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';

    this.loadDataForSelectedTimeType();
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

  loadThongKeTongQuan(): void {
    this.http.get<ThongKeDonHangDTO>('http://localhost:8080/api/thong-ke/tong-quan')
      .subscribe({
        next: (data) => {
          this.thongKeTongQuan = data;
          console.log('Fixed Overview Data:', this.thongKeTongQuan);
        },
        error: (err) => {
          console.error('Error loading fixed overview:', err);
        }
      });

    this.loadThongKeTongQuanFiltered();
  }

  loadThongKeTongQuanFiltered(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/tong-quan/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/tong-quan/tuan?year=${this.selectedYear}${this.selectedWeek ? `&week=${this.selectedWeek}` : ''}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/tong-quan/thang?year=${this.selectedYear}${this.selectedMonth ? `&month=${this.selectedMonth}` : ''}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/tong-quan/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<ThongKeDonHangDTO>(url)
      .subscribe({
        next: (data) => {
          this.thongKeTongQuanFiltered = data;
          console.log('Filtered Overview Data:', this.thongKeTongQuanFiltered);
        },
        error: (err) => {
          console.error('Error loading filtered overview:', err);
        }
      });
  }

  loadBestSellingProducts(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/best-selling/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/best-selling/tuan?year=${this.selectedYear}${this.selectedWeek ? `&week=${this.selectedWeek}` : ''}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/best-selling/thang?year=${this.selectedYear}${this.selectedMonth ? `&month=${this.selectedMonth}` : ''}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/best-selling/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<BestSellingProductDTO[]>(url)
      .subscribe({
        next: (data) => {
          this.bestSellingProducts = data;
          console.log('Best Selling Products:', this.bestSellingProducts);
        },
        error: (err) => {
          console.error('Error loading best-selling products:', err);
        }
      });
  }

  loadDataForSelectedTimeType(): void {
    this.loadThongKeTongQuanFiltered();
    this.loadBestSellingProducts();
    this.loadDoanhThu();
    this.loadSoLuongDon();
    if (this.compareYear) {
      this.loadCompareDoanhThu();
    }
  }

  loadDoanhThu(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.selectedYear}${this.selectedWeek ? `&week=${this.selectedWeek}` : ''}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.selectedYear}${this.selectedMonth ? `&month=${this.selectedMonth}` : ''}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url)
      .subscribe({
        next: (data) => {
          this.doanhThuData = data;
          this.updateDoanhThuChart();
        },
        error: (err) => {
          console.error('Error loading revenue data:', err);
        }
      });
  }

  loadCompareDoanhThu(): void {
    if (!this.compareYear) return;

    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.compareYear}${this.selectedWeek ? `&week=${this.selectedWeek}` : ''}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.compareYear}${this.selectedMonth ? `&month=${this.selectedMonth}` : ''}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.compareYear}`;
        break;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url)
      .subscribe({
        next: (data) => {
          this.compareDoanhThuData = data;
          const hasData = data.some(item => item.tongDoanhThu > 0 || item.doanhThuOnline > 0 || item.doanhThuOffline > 0);
          if (!hasData) {
            this.compareDoanhThuData = [];
          }
          this.updateDoanhThuChart();
        },
        error: (err) => {
          console.error('Error loading compare revenue data:', err);
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
  }

  loadSoLuongDon(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/tuan?year=${this.selectedYear}${this.selectedWeek ? `&week=${this.selectedWeek}` : ''}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/thang?year=${this.selectedYear}${this.selectedMonth ? `&month=${this.selectedMonth}` : ''}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<SoLuongDonHangDTO[]>(url)
      .subscribe({
        next: (data) => {
          this.soLuongDonData = data;
          this.soLuongDonConfig = {
            labels: data.map(item => item.thoiGian),
            datasets: [
              { data: data.map(item => item.soLuongDon), label: 'Số lượng đơn', backgroundColor: '#4BC0C0', borderColor: '#4BC0C0', fill: false }
            ]
          };
        },
        error: (err) => {
          console.error('Error loading order quantity data:', err);
        }
      });
  }

  onCompareYearChange(): void {
    this.loadDataForSelectedTimeType();
  }
}