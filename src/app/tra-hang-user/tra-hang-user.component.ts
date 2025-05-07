import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraHangService } from '../service/TraHangService';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-tra-hang-user',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tra-hang-user.component.html',
  styleUrls: ['./tra-hang-user.component.scss']
})
export class TraHangUserComponent implements OnInit {
  @Input() idTaiKhoan: number | null = null;
  yeuCauList: any[] = [];
  lichSuList: any[] = [];
  selectedYeuCau: number | null = null;
  showHistory: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(private traHangService: TraHangService, private tokenService: TokenService) {
    this.idTaiKhoan = this.tokenService.getUserId();
  }

  ngOnInit(): void {
    if (!this.idTaiKhoan) {
      this.error = 'Không thể lấy ID tài khoản từ token. Vui lòng đăng nhập lại.';
      return;
    }
    this.loadYeuCauList();
  }

  loadYeuCauList(): void {
    this.loading = true;
    this.traHangService.getYeuCauByTaiKhoan(this.idTaiKhoan!).subscribe({
      next: (data) => {
        this.yeuCauList = data;
        this.loading = false;
        console.log('Danh sách yêu cầu:', data);
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách yêu cầu trả hàng';
        this.loading = false;
      }
    });
  }

  loadLichSu(idYeuCau: number): void {
    // Nếu yêu cầu được nhấn đã được chọn, đóng bảng lịch sử
    if (this.selectedYeuCau === idYeuCau) {
      this.selectedYeuCau = null;
      this.lichSuList = [];
      this.showHistory = false;
      return;
    }

    // Đặt lại lịch sử trước đó và chọn yêu cầu mới
    this.lichSuList = [];
    this.selectedYeuCau = idYeuCau;
    this.showHistory = true;
    this.loading = true;

    this.traHangService.getLichSuByYeuCauTraHang(idYeuCau).subscribe({
      next: (data) => {
        this.lichSuList = data;
        this.loading = false;
        console.log('Danh sách lịch sử:', data);
      },
      error: (err) => {
        this.error = 'Không thể tải lịch sử trả hàng';
        this.lichSuList = [];
        this.loading = false;
      }
    });
  }
}