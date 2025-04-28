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
  showHistory: boolean = false; // Added for mobile history toggle
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
        console.log('yeuCauList', data);
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách yêu cầu trả hàng';
        this.loading = false;
      }
    });
  }

  loadLichSu(idYeuCau: number): void {
    this.loading = true;
    this.traHangService.getLichSuByYeuCauTraHang(idYeuCau).subscribe({
      next: (data) => {
        this.lichSuList = data;
        this.selectedYeuCau = idYeuCau;
        this.showHistory = true; // Show history modal on mobile
        this.loading = false;
        console.log('lichSuList', data);
      },
      error: (err) => {
        this.error = 'Không thể tải lịch sử trả hàng';
        this.lichSuList = [];
        this.loading = false;
      }
    });
  }
}