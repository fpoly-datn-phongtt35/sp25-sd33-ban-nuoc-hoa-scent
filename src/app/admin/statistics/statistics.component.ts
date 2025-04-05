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

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BaseChartDirective, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  thongKeTongQuan: ThongKeDonHangDTO | null = null; // Fixed overview
  thongKeTongQuanFiltered: ThongKeDonHangDTO | null = null; // Filtered overview

  doanhThuData: ThongKeTheoThoiGianDTO[] = [];
  soLuongDonData: SoLuongDonHangDTO[] = [];
  compareDoanhThuData: ThongKeTheoThoiGianDTO[] = [];

  // Dữ liệu cho dropdown
  selectedTimeType: string = 'tuan'; // Mặc định là thống kê theo tuần
  selectedMonth: string = new Date().getMonth() + 1 + ''; // Mặc định là tháng hiện tại
  selectedYear: string = new Date().getFullYear() + ''; // Mặc định là năm hiện tại
  compareYear: string | null = null; // Năm để so sánh
  selectedWeek: string = '1'; // Sẽ được cập nhật thành tuần hiện tại
  startDate: string = ''; // Sẽ được cập nhật thành hôm qua
  endDate: string = ''; // Sẽ được cập nhật thành hôm nay

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
  years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString()); // 10 năm gần nhất
  weeks = Array.from({ length: 52 }, (_, i) => (i + 1).toString()); // 52 tuần trong năm

  // Dữ liệu biểu đồ doanh thu
  doanhThuConfig: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  doanhThuOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Thời gian'
        } as any
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        } as any
      }
    },
    datasets: {
      bar: {
        maxBarThickness: 130 // Optional: Set a maximum width to ensure it doesn't get too wide
      }
    }
  };
  doanhThuType: ChartType = 'line'; // Cố định là dạng đường

  // Dữ liệu biểu đồ số lượng đơn
  soLuongDonConfig: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  soLuongDonOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Thời gian'
        } as any
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Số lượng đơn'
        } as any
      }
    },
    datasets: {
      bar: {
        barThickness: 120, // Set a fixed width for the bars (in pixels)
        maxBarThickness: 120 // Optional: Set a maximum width to ensure it doesn't get too wide
      }
    }
  };
  soLuongDonType: ChartType = 'bar'; // Biểu đồ số lượng đơn vẫn có thể thay đổi

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Tính tuần hiện tại
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((today.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7).toString();

    // Tính ngày hôm qua và hôm nay
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    this.startDate = yesterday.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
    this.endDate = today.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD

    // Chỉ thay đổi loại biểu đồ cho số lượng đơn, giữ biểu đồ doanh thu là dạng đường
    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';

    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }

    // Tải dữ liệu
    this.loadThongKeTongQuan();
    this.loadDataForSelectedTimeType();
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

    // Cập nhật nhãn trục x
    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }

    // Chỉ thay đổi loại biểu đồ cho số lượng đơn
    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';

    this.loadDataForSelectedTimeType();
  }

  getTimeLabel(): string {
    switch (this.selectedTimeType) {
      case 'ngay':
        return 'Ngày';
      case 'tuan':
        return 'Tuần';
      case 'thang':
        return 'Tháng';
      case 'nam':
        return 'Năm';
      default:
        return 'Thời gian';
    }
  }

  loadThongKeTongQuan(): void {
    // Load fixed overview
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

    // Load filtered overview
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

    console.log('Fetching filtered overview from URL:', url);

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

  loadDataForSelectedTimeType(): void {
    this.loadThongKeTongQuanFiltered(); // Load filtered overview when time type changes
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
          console.log('Revenue Data:', this.doanhThuData);
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
          console.log('Compare Revenue Data:', this.compareDoanhThuData);
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

    this.doanhThuConfig = {
      labels: labels,
      datasets: datasets
    };
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
          console.log('Order Quantity Data:', this.soLuongDonData);
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