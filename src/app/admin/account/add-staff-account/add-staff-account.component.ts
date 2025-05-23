import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../service/taikhoan.service';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-staff-account.component.html',
  styleUrls: ['./add-staff-account.component.scss'],
  providers: [NgbActiveModal]
})
export class AddStaffAccountComponent {
  @Output() accountAdded = new EventEmitter<any>(); // Emit event when account is added
  accountForm: FormGroup;
  showPassword: boolean = false; // Biến để toggle hiển thị mật khẩu

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {
    // Tùy chỉnh Validator cho họ và tên
    const hoTenValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true }; // Chỉ chứa dấu cách
      }
      const specialCharRegex = /^[a-zA-ZÀ-ỹ\s]+$/; // Chỉ cho phép chữ cái và dấu cách
      if (!specialCharRegex.test(value)) {
        return { specialChar: true }; // Chứa ký tự đặc biệt
      }
      return null;
    };

    // Tùy chỉnh Validator cho số điện thoại
    const sdtValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true }; // Chỉ chứa dấu cách
      }
      const pattern = /^0\d{9,10}$/; // Bắt đầu bằng 0, 10 hoặc 11 số
      if (!pattern.test(value)) {
        return { pattern: true };
      }
      return null;
    };

    // Tùy chỉnh Validator cho mật khẩu
    const matKhauValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true }; // Chỉ chứa dấu cách
      }
      if (value.length < 8) {
        return { minlength: true }; // Tối thiểu 8 ký tự
      }
      const hasUpperCase = /[A-Z]/.test(value); // Kiểm tra chữ hoa
      const hasNumber = /\d/.test(value); // Kiểm tra số
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value); // Kiểm tra ký tự đặc biệt
      if (!hasUpperCase) {
        return { uppercase: true };
      }
      if (!hasNumber) {
        return { number: true };
      }
      if (!hasSpecialChar) {
        return { specialChar: true };
      }
      return null;
    };

    // Khởi tạo form với các validators mới
    this.accountForm = this.fb.group({
      hoTen: ['', hoTenValidator],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', sdtValidator],
      tenDangNhap: ['', Validators.required],
      matKhau: ['', matKhauValidator],
    });
  }

  // Toggle hiển thị mật khẩu
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Lưu tài khoản
  saveAccount() {
    console.log('📌 Dữ liệu trong form:', this.accountForm.value);

    if (this.accountForm.valid) {
      const formData = { ...this.accountForm.value };
      formData.vaiTro = 'STAFF'; // Đặt vai trò mặc định là STAFF

      // Gửi yêu cầu API để thêm tài khoản
      this.accountService.register(formData).subscribe(
        (response: any) => {
          console.log('✅ API Response:', response);
          alert('Thêm tài khoản thành công!');
          this.accountAdded.emit(response);
          this.closeModal();
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm tài khoản:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ:', this.accountForm.errors);
      // Đánh dấu tất cả các trường là touched để hiển thị lỗi
      this.accountForm.markAllAsTouched();
    }
  }

  // Đóng modal
  closeModal() {
    console.log('🛑 Attempting to close modal...');
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
      console.log('✅ Dismiss method called');
    } else {
      console.error('❌ ActiveModal is not available');
    }

    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) {
        modalElement.remove();
      }
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      console.log('✅ Forced modal removal executed');
      this.cdr.detectChanges();
    }, 100);
  }
}