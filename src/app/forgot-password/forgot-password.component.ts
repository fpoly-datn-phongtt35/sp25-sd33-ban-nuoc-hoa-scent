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
  confirmPassword: string = '';
  step: number = 1;
  emailInvalid: boolean = false;
  emailNotFound: boolean = false;
  emailHasWhitespace: boolean = false;
  otpInvalid: boolean = false;
  otpHasWhitespace: boolean = false;
  newPasswordInvalid: boolean = false;
  newPasswordHasWhitespace: boolean = false;
  confirmPasswordInvalid: boolean = false;
  resendDisabled: boolean = true;
  countdown: number = 60; // Đồng bộ với BE
  private countdownInterval: any;
  isLoading: boolean = false;
  showNewPassword: boolean = false; // Biến để quản lý hiển thị mật khẩu mới
  showConfirmPassword: boolean = false; // Biến để quản lý hiển thị xác nhận mật khẩu
  constructor(private accountService: AccountService, private router: Router) {}

  private hasWhitespace(value: string): boolean {
    return /\s/.test(value);
  }
// Hàm chuyển đổi hiển thị/ẩn mật khẩu mới
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  // Hàm chuyển đổi hiển thị/ẩn xác nhận mật khẩu
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  checkEmail() {
    this.emailInvalid = false;
    this.emailNotFound = false;
    this.emailHasWhitespace = false;

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
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Thành công',
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
          this.step = 2;
        } else {
          this.emailNotFound = true;
          Swal.fire({
            title: 'Lỗi',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'Thử lại',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.emailNotFound = true;
        Swal.fire({
          title: 'Lỗi',
          text: err.message || 'Không thể kiểm tra email. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'center',
          timer: 3000,
          timerProgressBar: true,
        });
      },
    });
  }

  proceedToOtp() {
    this.newPasswordInvalid = false;
    this.newPasswordHasWhitespace = false;
    this.confirmPasswordInvalid = false;

    if (this.hasWhitespace(this.newPassword)) {
      this.newPasswordHasWhitespace = true;
      return;
    }

    if (
      !this.newPassword ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.newPassword)
    ) {
      this.newPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'center',
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu xác nhận không khớp!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'center',
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    this.isLoading = true;

    this.accountService.sendOtpForUser(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Thành công',
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
          this.step = 3;
          this.startCountdown();
        } else {
          Swal.fire({
            title: 'Lỗi',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'Thử lại',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Lỗi',
          text: err.message || 'Không thể gửi OTP. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'center',
          timer: 3000,
          timerProgressBar: true,
        });
      },
    });
  }

  resendOtp() {
    if (this.resendDisabled) return;
    this.isLoading = true;
    this.accountService.sendOtpForUser(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Thành công',
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
          this.startCountdown();
        } else {
          Swal.fire({
            title: 'Lỗi',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'Thử lại',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Lỗi',
          text: err.message || 'Không thể gửi OTP. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'center',
          timer: 3000,
          timerProgressBar: true,
        });
      },
    });
  }

  resetPassword() {
    this.otpInvalid = false;
    this.otpHasWhitespace = false;

    if (this.hasWhitespace(this.otp)) {
      this.otpHasWhitespace = true;
      return;
    }

    if (!this.otp || !/^\d{6}$/.test(this.otp)) {
      this.otpInvalid = true;
      return;
    }

    this.isLoading = true;

    this.accountService.resetPasswordWithOtp(this.email, this.otp, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire({
            title: 'Thành công',
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          }).then(() => {
            this.router.navigate(['/login']);
          });
        } else {
          Swal.fire({
            title: 'Lỗi',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'Thử lại',
            position: 'center',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Lỗi',
          text: err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'center',
          timer: 3000,
          timerProgressBar: true,
        });
      },
    });
  }

  startCountdown() {
    this.resendDisabled = true;
    this.countdown = 90;

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