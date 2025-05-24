import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../../service/taikhoan.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account-staff-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-staff-update.component.html',
  styleUrls: ['./account-staff-update.component.scss']
})
export class AccountStaffUpdateComponent implements OnInit, OnDestroy {
  @Input() account: any;
  @Input() accounts: any[] = [];
  @Output() accountUpdated = new EventEmitter<any>();
  updateForm: FormGroup;
  private hoTenSubscription: Subscription | undefined;
  private tenDangNhapSubscription: Subscription | undefined;
  private initialUsername: string;
  private isUsernameManuallyEdited: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private accountService: AccountService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    const hoTenValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) return { required: true };
      if (value.length === 0) return { onlyWhitespace: true };
      const specialCharRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
      if (!specialCharRegex.test(value)) return { specialChar: true };
      const words = value.split(/\s+/).filter(word => word.length > 0);
      if (words.length < 2) return { insufficientWords: true };
      return null;
    };

    const emailExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const email = control.value?.trim();
      if (!email || !this.accounts) return null;
      if (email.toLowerCase() === this.account?.email?.toLowerCase()) return null;
      const emailExists = this.accounts.some(account => account.email?.toLowerCase() === email.toLowerCase());
      return emailExists ? { emailExists: true } : null;
    };

    const sdtExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const sdt = control.value?.trim();
      if (!sdt || !this.accounts) return null;
      if (sdt === this.account?.sdt) return null;
      const sdtExists = this.accounts.some(account => account.sdt === sdt);
      return sdtExists ? { sdtExists: true } : null;
    };

    const sdtValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) return { required: true };
      if (value.length === 0) return { onlyWhitespace: true };
      const pattern = /^0\d{9,10}$/;
      if (!pattern.test(value)) return { pattern: true };
      return null;
    };

    const usernameExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const username = control.value?.trim();
      if (!username || !this.accounts) return null;
      if (username.toLowerCase() === this.account?.tenDangNhap?.toLowerCase()) return null;
      const usernameExists = this.accounts.some(account => account.tenDangNhap?.toLowerCase() === username.toLowerCase());
      return usernameExists ? { usernameExists: true } : null;
    };

    const usernameFormatValidator: ValidatorFn = (control: AbstractControl) => {
      const username = control.value?.trim();
      if (!username) return { required: true };
      const pattern = /^[a-z0-9]+$/;
      if (!pattern.test(username)) return { invalidFormat: true };
      return null;
    };

    this.updateForm = this.fb.group({
      id: [''],
      hoTen: ['', hoTenValidator],
      email: ['', [Validators.required, Validators.email, emailExistsValidator]],
      sdt: ['', [sdtValidator, sdtExistsValidator]],
      tenDangNhap: ['', [Validators.required, usernameFormatValidator, usernameExistsValidator]]
    });
  }

  ngOnInit(): void {
    if (this.account) {
      this.updateForm.patchValue({
        id: this.account.id,
        hoTen: this.account.hoTen,
        email: this.account.email,
        sdt: this.account.sdt,
        tenDangNhap: this.account.tenDangNhap
      });
      this.initialUsername = this.account.tenDangNhap;
    }

    this.hoTenSubscription = this.updateForm.get('hoTen')?.valueChanges.subscribe(value => {
      if (!this.isUsernameManuallyEdited) {
        const generatedUsername = this.generateUsername(value);
        this.updateForm.get('tenDangNhap')?.setValue(generatedUsername, { emitEvent: false });
      }
    });

    this.tenDangNhapSubscription = this.updateForm.get('tenDangNhap')?.valueChanges.subscribe(value => {
      const generatedUsername = this.generateUsername(this.updateForm.get('hoTen')?.value);
      if (value !== generatedUsername && value !== this.initialUsername) {
        this.isUsernameManuallyEdited = true;
      }
      console.log('🔍 Tên đăng nhập thay đổi:', value, 'Chỉnh sửa thủ công:', this.isUsernameManuallyEdited);
    });
  }

  ngOnDestroy(): void {
    if (this.hoTenSubscription) this.hoTenSubscription.unsubscribe();
    if (this.tenDangNhapSubscription) this.tenDangNhapSubscription.unsubscribe();
  }

  generateUsername(hoTen: string): string {
    if (!hoTen) return '';
    const normalized = hoTen.trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');

    if (parts.length < 2) return '';

    const ten = parts[parts.length - 1];
    const ho = parts[0];
    const tenDem = parts.slice(1, parts.length - 1);

    let username = ten;
    if (ho) username += ho.charAt(0);
    tenDem.forEach(dem => {
      if (dem) username += dem.charAt(0);
    });

    return this.removeVietnameseDiacritics(username);
  }

  removeVietnameseDiacritics(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  makeUniqueUsername(baseUsername: string): string {
    let username = baseUsername;
    let counter = 1;

    while (
      this.accounts.some(
        account =>
          account.tenDangNhap?.toLowerCase() === username.toLowerCase() &&
          account.tenDangNhap?.toLowerCase() !== this.account?.tenDangNhap?.toLowerCase()
      )
    ) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  updateAccount(): void {
    console.log('📌 Dữ liệu trong form:', this.updateForm.value);
    console.log('📌 Trạng thái form:', this.updateForm.valid ? 'Hợp lệ' : 'Không hợp lệ');
    console.log('📌 Lỗi của từng trường:', {
      hoTen: this.updateForm.get('hoTen')?.errors,
      email: this.updateForm.get('email')?.errors,
      sdt: this.updateForm.get('sdt')?.errors,
      tenDangNhap: this.updateForm.get('tenDangNhap')?.errors
    });

    if (this.updateForm.valid) {
      let finalUsername = this.updateForm.get('tenDangNhap')?.value;

      // Kiểm tra trùng lặp trực tiếp trước khi gửi
      const isUsernameExists = this.accounts.some(
        account =>
          account.tenDangNhap?.toLowerCase() === finalUsername.toLowerCase() &&
          account.tenDangNhap?.toLowerCase() !== this.account?.tenDangNhap?.toLowerCase()
      );

      if (isUsernameExists) {
        finalUsername = this.makeUniqueUsername(finalUsername);
        this.updateForm.get('tenDangNhap')?.setValue(finalUsername, { emitEvent: false });
      }

      const dto = {
        id: this.updateForm.value.id,
        hoTen: this.updateForm.value.hoTen,
        email: this.updateForm.value.email,
        sdt: this.updateForm.value.sdt,
        tenDangNhap: finalUsername
      };

      this.accountService.updateAccount(dto).subscribe({
        next: (response) => {
          console.log('✅ Cập nhật tài khoản thành công:', response);
          this.accountUpdated.emit(response);
          Swal.fire({
            title: 'Thành công',
            text: 'Cập nhật tài khoản thành công!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.activeModal.close();
        },
        error: (error) => {
          console.error('❌ Lỗi khi cập nhật tài khoản:', error);
          Swal.fire({
            title: 'Lỗi',
            text: error.error?.message || 'Cập nhật tài khoản thất bại. Vui lòng thử lại.',
            icon: 'error'
          });
        }
      });
    } else {
      console.warn('⚠️ Form không hợp lệ:', this.updateForm.errors);
      this.updateForm.markAllAsTouched();

      // Hiển thị thông báo lỗi chi tiết
      const errors: string[] = [];
      const hoTenErrors = this.updateForm.get('hoTen')?.errors;
      if (hoTenErrors) {
        if (hoTenErrors['required']) errors.push('Họ và tên là bắt buộc.');
        if (hoTenErrors['onlyWhitespace']) errors.push('Họ và tên không được chỉ chứa dấu cách.');
        if (hoTenErrors['specialChar']) errors.push('Họ và tên không được chứa ký tự đặc biệt.');
        if (hoTenErrors['insufficientWords']) errors.push('Họ và tên phải có ít nhất 2 từ.');
      }

      const emailErrors = this.updateForm.get('email')?.errors;
      if (emailErrors) {
        if (emailErrors['required']) errors.push('Email là bắt buộc.');
        if (emailErrors['email']) errors.push('Email không hợp lệ.');
        if (emailErrors['emailExists']) errors.push('Email đã tồn tại trong hệ thống.');
      }

      const sdtErrors = this.updateForm.get('sdt')?.errors;
      if (sdtErrors) {
        if (sdtErrors['required']) errors.push('Số điện thoại là bắt buộc.');
        if (sdtErrors['onlyWhitespace']) errors.push('Số điện thoại không được chỉ chứa dấu cách.');
        if (sdtErrors['pattern']) errors.push('Số điện thoại phải bắt đầu bằng 0 và có 10 hoặc 11 chữ số.');
        if (sdtErrors['sdtExists']) errors.push('Số điện thoại đã tồn tại trong hệ thống.');
      }

      const tenDangNhapErrors = this.updateForm.get('tenDangNhap')?.errors;
      if (tenDangNhapErrors) {
        if (tenDangNhapErrors['required']) errors.push('Tên đăng nhập là bắt buộc.');
        if (tenDangNhapErrors['invalidFormat']) errors.push('Tên đăng nhập chỉ được chứa chữ cái (a-z) hoặc số (0-9).');
        if (tenDangNhapErrors['usernameExists']) errors.push('Tên đăng nhập đã tồn tại trong hệ thống.');
      }

      if (errors.length > 0) {
        Swal.fire({
          title: 'Lỗi',
          html: errors.join('<br>'),
          icon: 'error'
        });
      }
    }
  }

  closeModal(): void {
    console.log('🛑 Attempting to close modal...');
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
      console.log('✅ Dismiss method called');
    } else {
      console.error('❌ ActiveModal is not available');
    }

    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) modalElement.remove();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
      document.body.classList.remove('modal-open');
      console.log('✅ Forced modal removal executed');
      this.cdr.detectChanges();
    }, 100);
  }
}