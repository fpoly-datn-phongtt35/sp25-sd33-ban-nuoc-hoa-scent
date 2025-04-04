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
  thongKeTongQuan: ThongKeDonHangDTO | null = null;

  // Dữ liệu cho dropdown
  selectedTimeType: string = 'thang'; // Mặc định là thống kê theo tháng
  selectedMonth: string = new Date().getMonth() + 1 + ''; // Mặc định là tháng hiện tại
  selectedYear: string = new Date().getFullYear() + ''; // Mặc định là năm hiện tại
  selectedWeek: string = '1'; // Mặc định là tuần 1
  startDate: string = ''; // Ngày bắt đầu
  endDate: string = ''; // Ngày kết thúc

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
        } as any // Sử dụng `as any` để tránh lỗi TypeScript
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        } as any
      }
    }
  };
  doanhThuType: ChartType = 'bar';

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
        } as any // Sử dụng `as any` để tránh lỗi TypeScript
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Số lượng đơn'
        } as any
      }
    }
  };
  soLuongDonType: ChartType = 'bar';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadThongKeTongQuan();
    this.loadDataForSelectedTimeType(); // Tải dữ liệu ban đầu dựa trên loại thời gian mặc định
  }

  // Hàm xử lý khi người dùng thay đổi loại thống kê
  onTimeTypeChange(): void {
    // Cập nhật loại biểu đồ dựa trên loại thời gian
    this.doanhThuType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';
    this.soLuongDonType = this.selectedTimeType === 'ngay' ? 'line' : 'bar';

    // Cập nhật tiêu đề trục X
    if (this.doanhThuOptions.scales && this.doanhThuOptions.scales['x']) {
      (this.doanhThuOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }
    if (this.soLuongDonOptions.scales && this.soLuongDonOptions.scales['x']) {
      (this.soLuongDonOptions.scales['x'] as any).title.text = this.getTimeLabel();
    }

    // Tải dữ liệu
    this.loadDataForSelectedTimeType();
  }

  // Hàm lấy nhãn trục X dựa trên loại thời gian
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

  // Hàm tải dữ liệu dựa trên loại thời gian được chọn
  loadDataForSelectedTimeType(): void {
    this.loadDoanhThu();
    this.loadSoLuongDon();
  }

  loadThongKeTongQuan(): void {
    this.http.get<ThongKeDonHangDTO>('http://localhost:8080/api/thong-ke/tong-quan')
      .subscribe(data => {
        this.thongKeTongQuan = data;
      });
  }

  loadDoanhThu(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/tuan?year=${this.selectedYear}&week=${this.selectedWeek}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/thang?year=${this.selectedYear}&month=${this.selectedMonth}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/doanh-thu/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<ThongKeTheoThoiGianDTO[]>(url)
      .subscribe(data => {
        this.doanhThuConfig = {
          labels: data.map(item => item.thoiGian),
          datasets: [
            { data: data.map(item => item.tongDoanhThu), label: 'Tổng doanh thu', backgroundColor: '#FF6384', borderColor: '#FF6384', fill: false },
            { data: data.map(item => item.doanhThuOnline), label: 'Doanh thu online', backgroundColor: '#36A2EB', borderColor: '#36A2EB', fill: false },
            { data: data.map(item => item.doanhThuOffline), label: 'Doanh thu offline', backgroundColor: '#FFCE56', borderColor: '#FFCE56', fill: false }
          ]
        };
      });
  }

  loadSoLuongDon(): void {
    let url = '';
    switch (this.selectedTimeType) {
      case 'ngay':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/ngay?startDate=${this.startDate}&endDate=${this.endDate}`;
        break;
      case 'tuan':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/tuan?year=${this.selectedYear}&week=${this.selectedWeek}`;
        break;
      case 'thang':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/thang?year=${this.selectedYear}&month=${this.selectedMonth}`;
        break;
      case 'nam':
        url = `http://localhost:8080/api/thong-ke/so-luong-don/nam?year=${this.selectedYear}`;
        break;
    }

    this.http.get<SoLuongDonHangDTO[]>(url)
      .subscribe(data => {
        this.soLuongDonConfig = {
          labels: data.map(item => item.thoiGian),
          datasets: [
            { data: data.map(item => item.soLuongDon), label: 'Số lượng đơn', backgroundColor: '#4BC0C0', borderColor: '#4BC0C0', fill: false }
          ]
        };
      });
  }
}