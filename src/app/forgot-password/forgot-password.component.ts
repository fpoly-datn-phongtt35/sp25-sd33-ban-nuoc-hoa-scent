import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AccountService } from '../service/taikhoan.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  step: number = 1; // 1: Nhập email, 2: Nhập mật khẩu mới, 3: Nhập OTP
  emailInvalid: boolean = false;
  emailNotFound: boolean = false;
  otpInvalid: boolean = false;
  newPasswordInvalid: boolean = false;
  resendDisabled: boolean = true;
  countdown: number = 90; // Đồng bộ với backend (90 giây)
  private countdownInterval: any;
  isLoading: boolean = false;

  constructor(private accountService: AccountService, private router: Router) {}

  // Bước 1: Kiểm tra email
  checkEmail() {
    if (!this.email || !this.email.includes('@')) {
      this.emailInvalid = true;
      return;
    }
    this.emailInvalid = false;
    this.emailNotFound = false;
    this.isLoading = true;

    this.accountService.findByEmail(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Thành công',
          text: 'Email hợp lệ, vui lòng nhập mật khẩu mới.',
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'bottom-end',
          timer: 3000,
        });
        this.step = 2; // Chuyển sang bước nhập mật khẩu mới
      },
      error: () => {
        this.isLoading = false;
        this.emailNotFound = true;
        Swal.fire({
          title: 'Lỗi',
          text: 'Email không tồn tại trong hệ thống!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
      },
    });
  }

  // Bước 2: Kiểm tra mật khẩu mới và gửi OTP
  proceedToOtp() {
    if (!this.newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.newPassword)) {
      this.newPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'bottom-end',
        timer: 3000,
      });
      return;
    }
    this.newPasswordInvalid = false;
    this.isLoading = true;

    this.accountService.sendOtpForUser(this.email).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'bottom-end',
          timer: 3000,
        });
        this.step = 3; // Chuyển sang bước nhập OTP
        this.startCountdown();
      },
      error: (err) => {
        const errorMessage = err.error || 'Không thể gửi OTP. Vui lòng thử lại!';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Gửi lại OTP
  resendOtp() {
    if (this.resendDisabled) return;
    this.isLoading = true;
    this.accountService.sendOtpForUser(this.email).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'bottom-end',
          timer: 3000,
        });
        this.startCountdown();
      },
      error: (err) => {
        const errorMessage = err.error || 'Không thể gửi OTP. Vui lòng thử lại!';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Bước 3: Xác nhận OTP và đặt lại mật khẩu
  resetPassword() {
    if (!this.otp || !/^\d{6}$/.test(this.otp)) {
      this.otpInvalid = true;
      return;
    }
    this.otpInvalid = false;
    this.isLoading = true;

    this.accountService.resetPasswordWithOtp(this.email, this.otp, this.newPassword).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'bottom-end',
          timer: 3000,
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const errorMessage = err.error || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  startCountdown() {
    this.resendDisabled = true;
    this.countdown = 30;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
