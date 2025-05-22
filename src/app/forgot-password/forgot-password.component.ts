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
  emailHasWhitespace: boolean = false; // Thêm biến để kiểm tra dấu cách trong email
  otpInvalid: boolean = false;
  otpHasWhitespace: boolean = false; // Thêm biến để kiểm tra dấu cách trong OTP
  newPasswordInvalid: boolean = false;
  newPasswordHasWhitespace: boolean = false; // Thêm biến để kiểm tra dấu cách trong mật khẩu mới
  resendDisabled: boolean = true;
  countdown: number = 90; // Đồng bộ với backend (90 giây)
  private countdownInterval: any;
  isLoading: boolean = false;

  constructor(private accountService: AccountService, private router: Router) {}

  // Hàm kiểm tra dấu cách
  private hasWhitespace(value: string): boolean {
    return /\s/.test(value); // Kiểm tra dấu cách bằng regex
  }

  // Bước 1: Kiểm tra email
  checkEmail() {
    this.emailInvalid = false;
    this.emailNotFound = false;
    this.emailHasWhitespace = false;

    // Kiểm tra email có hợp lệ và không chứa dấu cách
    if (!this.email || !this.email.includes('@')) {
      this.emailInvalid = true;
      return;
    }
    if (this.hasWhitespace(this.email)) {
      this.emailHasWhitespace = true;
      return;
    }

    this.isLoading = true;

    this.accountService.findByEmail(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Thành công',
          text: 'Email hợp lệ, vui lòng nhập mật khẩu mới.',
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
        });
      },
    });
  }

  // Bước 2: Kiểm tra mật khẩu mới và gửi OTP
  proceedToOtp() {
    this.newPasswordInvalid = false;
    this.newPasswordHasWhitespace = false;

    // Kiểm tra mật khẩu mới không chứa dấu cách
    if (this.hasWhitespace(this.newPassword)) {
      this.newPasswordHasWhitespace = true;
      return;
    }

    // Kiểm tra độ mạnh mật khẩu
    if (!this.newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.newPassword)) {
      this.newPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'center',
        customClass: {
          popup: 'swal2-centered',
          icon: 'swal2-icon',
          title: 'swal2-title',
          htmlContainer: 'swal2-content',
          confirmButton: 'swal2-confirm',
        },
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: true,
      });
      return;
    }

    this.isLoading = true;

    this.accountService.sendOtpForUser(this.email).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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
    this.otpInvalid = false;
    this.otpHasWhitespace = false;

    // Kiểm tra OTP không chứa dấu cách
    if (this.hasWhitespace(this.otp)) {
      this.otpHasWhitespace = true;
      return;
    }

    // Kiểm tra OTP hợp lệ
    if (!this.otp || !/^\d{6}$/.test(this.otp)) {
      this.otpInvalid = true;
      return;
    }

    this.isLoading = true;

    this.accountService.resetPasswordWithOtp(this.email, this.otp, this.newPassword).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        const errorMessage = err.error || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!';
        Swal.fire({
          title: 'Lỗi',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'center',
          customClass: {
            popup: 'swal2-centered',
            icon: 'swal2-icon',
            title: 'swal2-title',
            htmlContainer: 'swal2-content',
            confirmButton: 'swal2-confirm',
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: true,
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