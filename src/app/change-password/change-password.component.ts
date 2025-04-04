import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AccountService } from '../service/taikhoan.service';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordModalComponent implements OnDestroy {
  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  otp: string = '';
  step: number = 1;
  oldPasswordInvalid: boolean = false;
  newPasswordInvalid: boolean = false;
  confirmPasswordInvalid: boolean = false;
  otpInvalid: boolean = false;
  resendDisabled: boolean = true;
  countdown: number = 90;
  private countdownInterval: any;
  isLoading: boolean = false;
  email: string = '';
  username: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private accountService: AccountService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.username = userInfo.sub;
      this.accountService.findByUsername(this.username).subscribe({
        next: (user: any) => {
          this.email = user.email;
        },
        error: () => {
          Swal.fire({
            title: 'Lỗi',
            text: 'Không thể lấy thông tin người dùng!',
            icon: 'error',
            confirmButtonText: 'OK',
            position: 'bottom-end',
            timer: 3000,
          });
          this.closeModal();
        },
      });
    } else {
      Swal.fire({
        title: 'Lỗi',
        text: 'Bạn chưa đăng nhập!',
        icon: 'error',
        confirmButtonText: 'OK',
        position: 'bottom-end',
        timer: 3000,
      });
      this.closeModal();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  checkOldPassword(): void {
    if (!this.oldPassword) {
      this.oldPasswordInvalid = true;
      return;
    }

    if (!this.newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.newPassword)) {
      this.newPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'bottom-end',
        timer: 3000,
      });
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.confirmPasswordInvalid = true;
      Swal.fire({
        title: 'Lỗi',
        text: 'Mật khẩu xác nhận không khớp!',
        icon: 'error',
        confirmButtonText: 'Thử lại',
        position: 'bottom-end',
        timer: 3000,
      });
      return;
    }

    this.oldPasswordInvalid = false;
    this.newPasswordInvalid = false;
    this.confirmPasswordInvalid = false;
    this.isLoading = true;

    // Gọi API kiểm tra mật khẩu cũ
    this.accountService.verifyOldPassword(this.username, this.oldPassword).subscribe({
      next: (response) => {
        if (response === 'Mật khẩu cũ hợp lệ') {
          this.sendOtp(); // Gửi OTP nếu mật khẩu cũ đúng
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.oldPasswordInvalid = true;
        Swal.fire({
          title: 'Lỗi',
          text: err.error || 'Mật khẩu cũ không đúng!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
      },
    });
  }

  sendOtp(): void {
    this.accountService.sendOtp(this.email).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Thành công',
          text: response,
          icon: 'success',
          confirmButtonText: 'OK',
          position: 'bottom-end',
          timer: 3000,
          didClose: () => {
            // Đảm bảo modal không đóng sau khi thông báo
            this.step = 2; // Chuyển sang bước nhập OTP
            this.startCountdown();
            this.isLoading = false;
            this.cdr.detectChanges(); // Cập nhật giao diện
          },
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Lỗi',
          text: err.error || 'Không thể gửi OTP. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  startCountdown(): void {
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
      this.cdr.detectChanges();
    }, 1000);
  }

  resendOtp(): void {
    if (this.resendDisabled) return;
    this.sendOtp();
  }

  verifyOtpAndChangePassword(): void {
    if (!this.otp || !/^\d{6}$/.test(this.otp)) {
      this.otpInvalid = true;
      return;
    }
    this.otpInvalid = false;
    this.isLoading = true;

    this.accountService.verifyOtp(this.email, this.otp).subscribe({
      next: () => {
        // Đổi mật khẩu sau khi OTP xác nhận thành công
        this.accountService.changePassword(this.username, this.oldPassword, this.newPassword).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Thành công',
              text: response,
              icon: 'success',
              confirmButtonText: 'OK',
              position: 'bottom-end',
              timer: 3000,
            });
            this.closeModal();
          },
          error: (err) => {
            Swal.fire({
              title: 'Lỗi',
              text: err.error || 'Không thể đổi mật khẩu. Vui lòng thử lại!',
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
      },
      error: (err) => {
        Swal.fire({
          title: 'Lỗi',
          text: err.error || 'OTP không hợp lệ hoặc đã hết hạn!',
          icon: 'error',
          confirmButtonText: 'Thử lại',
          position: 'bottom-end',
          timer: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  closeModal(): void {
    this.activeModal.dismiss('cancel');
    this.resetForm();
  }

  resetForm(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.otp = '';
    this.step = 1;
    this.oldPasswordInvalid = false;
    this.newPasswordInvalid = false;
    this.confirmPasswordInvalid = false;
    this.otpInvalid = false;
    this.isLoading = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
