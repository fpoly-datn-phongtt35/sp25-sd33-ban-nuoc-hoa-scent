import { Component, OnInit } from '@angular/core';
import { TokenService } from '../service/token.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AccountService } from '../service/taikhoan.service';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit {
  userInfo: any = {};

  constructor(
    private accountService: AccountService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired()) {
      const username = this.tokenService.getUserInfo()?.sub;
      if (username) {
        this.accountService.findByUsername(username).subscribe({
          next: (data) => {
            this.userInfo = data;
          },
          error: (err) => {
            console.error('Lỗi khi lấy thông tin tài khoản:', err);
            alert('Không thể tải thông tin tài khoản!');
          },
        });
      }
    }
  }

  updateAccount(): void {
    this.accountService.updateAccount(this.userInfo).subscribe({
      next: () => {
        alert('Cập nhật thông tin tài khoản thành công!');
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật tài khoản:', err);
        alert('Cập nhật thông tin thất bại!');
      },
    });
  }
}
