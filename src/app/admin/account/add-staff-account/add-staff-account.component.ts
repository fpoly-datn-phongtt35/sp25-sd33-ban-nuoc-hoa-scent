import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../service/taikhoan.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-staff-account.component.html',
  styleUrls: ['./add-staff-account.component.scss'],
  providers: [NgbActiveModal]
})
export class AddStaffAccountComponent implements OnInit, OnDestroy {
  @Input() accounts: any[] = []; // Nhận danh sách accounts từ parent component
  @Output() accountAdded = new EventEmitter<any>();
  accountForm: FormGroup;
  showPassword: boolean = false;
  private hoTenSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {
    // Validator đồng bộ để kiểm tra email tồn tại
    const emailExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const email = control.value?.trim();
      if (!email || !this.accounts) {
        return null;
      }
      const emailExists = this.accounts.some(account => account.email?.toLowerCase() === email.toLowerCase());
      return emailExists ? { emailExists: true } : null;
    };

    // Validator đồng bộ để kiểm tra tên đăng nhập tồn tại
    const usernameExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const username = control.value?.trim();
      if (!username || !this.accounts) {
        return null;
      }
      const usernameExists = this.accounts.some(account => account.tenDangNhap?.toLowerCase() === username.toLowerCase());
      return usernameExists ? { usernameExists: true } : null;
    };

    // Validator đồng bộ để kiểm tra số điện thoại tồn tại
    const sdtExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const sdt = control.value?.trim();
      if (!sdt || !this.accounts) {
        return null;
      }
      const sdtExists = this.accounts.some(account => account.sdt === sdt);
      return sdtExists ? { sdtExists: true } : null;
    };

    // Validator cho họ và tên
    const hoTenValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true };
      }
      const specialCharRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
      if (!specialCharRegex.test(value)) {
        return { specialChar: true };
      }
      // Kiểm tra số lượng từ (phải có ít nhất 2 từ: họ và tên)
      const words = value.split(/\s+/).filter(word => word.length > 0);
      if (words.length < 2) {
        return { insufficientWords: true }; // Lỗi nếu chỉ có 1 từ
      }
      return null;
    };

    // Validator cho số điện thoại
    const sdtValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true };
      }
      const pattern = /^0\d{9,10}$/;
      if (!pattern.test(value)) {
        return { pattern: true };
      }
      return null;
    };

    // Validator cho mật khẩu
    const matKhauValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) {
        return { required: true };
      }
      if (value.length === 0) {
        return { onlyWhitespace: true };
      }
      if (value.length < 8) {
        return { minlength: true };
      }
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
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

    // Khởi tạo form với các validators
    this.accountForm = this.fb.group({
      hoTen: ['', hoTenValidator],
      email: ['', [Validators.required, Validators.email, emailExistsValidator]],
      sdt: ['', [sdtValidator, sdtExistsValidator]],
      tenDangNhap: ['', [Validators.required, usernameExistsValidator]],
      matKhau: ['', matKhauValidator],
    });
  }

  ngOnInit(): void {
    // Lắng nghe thay đổi của trường hoTen để tự động tạo tenDangNhap
    this.hoTenSubscription = this.accountForm.get('hoTen')?.valueChanges.subscribe(value => {
      if (value) {
        const generatedUsername = this.generateUsername(value);
        this.accountForm.get('tenDangNhap')?.setValue(generatedUsername, { emitEvent: false });
      } else {
        this.accountForm.get('tenDangNhap')?.setValue('', { emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.hoTenSubscription) {
      this.hoTenSubscription.unsubscribe();
    }
  }

  // Hàm tạo tên đăng nhập từ họ và tên
  generateUsername(hoTen: string): string {
    // Chuẩn hóa và tách họ tên
    const normalized = hoTen.trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');

    if (parts.length < 2) {
      return '';
    }

    // Lấy tên (phần cuối cùng)
    const ten = parts[parts.length - 1];
    // Lấy họ (phần đầu tiên)
    const ho = parts[0];
    // Lấy các tên đệm (nếu có)
    const tenDem = parts.slice(1, parts.length - 1);

    // Tạo tên đăng nhập: tên + chữ cái đầu của họ + chữ cái đầu của các tên đệm
    let username = ten;
    if (ho) {
      username += ho.charAt(0);
    }
    tenDem.forEach(dem => {
      if (dem) {
        username += dem.charAt(0);
      }
    });

    // Loại bỏ dấu tiếng Việt
    username = this.removeVietnameseDiacritics(username);

    // Kiểm tra trùng lặp và thêm số nếu cần
    return this.makeUniqueUsername(username);
  }

  // Hàm loại bỏ dấu tiếng Việt
  removeVietnameseDiacritics(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  // Hàm kiểm tra và tạo tên đăng nhập không trùng lặp
  makeUniqueUsername(baseUsername: string): string {
    let username = baseUsername;
    let counter = 1;

    // Kiểm tra xem username có tồn tại trong danh sách accounts không
    while (this.accounts.some(account => account.tenDangNhap?.toLowerCase() === username.toLowerCase())) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
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

      this.accountService.register(formData).subscribe({
        next: (response: any) => {
          console.log('✅ API Response:', response);
          Swal.fire({
            title: 'Thành công',
            text: 'Thêm tài khoản thành công!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.accountAdded.emit(response);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Lỗi khi thêm tài khoản:', error);
          if (error.status === 409) {
            Swal.fire({
              title: 'Lỗi',
              text: 'Email, tên đăng nhập hoặc số điện thoại đã tồn tại trong hệ thống.',
              icon: 'error'
            });
          } else {
            Swal.fire({
              title: 'Lỗi',
              text: 'Lỗi khi thêm tài khoản. Vui lòng thử lại.',
              icon: 'error'
            });
          }
        }
      });
    } else {
      console.warn('⚠️ Form không hợp lệ:', this.accountForm.errors);
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