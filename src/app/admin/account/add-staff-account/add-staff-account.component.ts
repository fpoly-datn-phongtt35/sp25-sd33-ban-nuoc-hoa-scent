import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AccountService } from '../../../service/taikhoan.service';

@Component({
  selector: 'app-add-staff-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-staff-account.component.html',
  styleUrls: ['./add-staff-account.component.scss'],
  providers: [NgbActiveModal]
})
export class AddStaffAccountComponent implements OnInit, OnDestroy {
  @Input() accounts: any[] = [];
  @Output() accountAdded = new EventEmitter<any>();
  accountForm: FormGroup;
  private hoTenSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    
  ) {
    // Validator cho hoTen
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

    // Validator cho email
    const emailExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const email = control.value?.trim();
      if (!email || !this.accounts) return null;
      return this.accounts.some(account => account.email?.toLowerCase() === email.toLowerCase())
        ? { emailExists: true }
        : null;
    };

    // Validator cho soDienThoai
    const sdtValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) return { required: true };
      if (value.length === 0) return { onlyWhitespace: true };
      const pattern = /^0\d{9,10}$/;
      if (!pattern.test(value)) return { pattern: true };
      return null;
    };

    const sdtExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const sdt = control.value?.trim();
      if (!sdt || !this.accounts) return null;
      return this.accounts.some(account => account.soDienThoai === sdt)
        ? { sdtExists: true }
        : null;
    };

    // Validator cho username
    const usernameExistsValidator: ValidatorFn = (control: AbstractControl) => {
      const username = control.value?.trim();
      if (!username || !this.accounts) return null;
      return this.accounts.some(account => account.username?.toLowerCase() === username.toLowerCase())
        ? { usernameExists: true }
        : null;
    };

    this.accountForm = this.fb.group({
      hoTen: ['', hoTenValidator],
      email: ['', [Validators.required, Validators.email, emailExistsValidator]],
      soDienThoai: ['', [sdtValidator, sdtExistsValidator]],
      username: ['', [Validators.required, usernameExistsValidator]]
    });
  }

  ngOnInit(): void {
    // Tự động tạo username khi hoTen thay đổi
    this.hoTenSubscription = this.accountForm.get('hoTen')?.valueChanges.subscribe(value => {
      if (value) {
        const generatedUsername = this.generateUsername(value);
        this.accountForm.get('username')?.setValue(generatedUsername, { emitEvent: false });
      } else {
        this.accountForm.get('username')?.setValue('', { emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.hoTenSubscription?.unsubscribe();
  }

  generateUsername(hoTen: string): string {
    const normalized = hoTen.trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');
    if (parts.length < 2) return '';
    const ten = parts[parts.length - 1];
    const ho = parts[0];
    const tenDem = parts.slice(1, parts.length - 1);
    let username = ten + (ho ? ho.charAt(0) : '');
    tenDem.forEach(dem => username += dem.charAt(0));
    username = this.removeVietnameseDiacritics(username);
    return this.makeUniqueUsername(username);
  }

  randomizeUsername(): void {
    const hoTen = this.accountForm.get('hoTen')?.value;
    if (!hoTen || this.accountForm.get('hoTen')?.invalid) return;

    const normalized = hoTen.trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');
    if (parts.length < 2) return;

    // Tạo ngẫu nhiên bằng cách xáo trộn hoặc thêm số ngẫu nhiên
    const ten = parts[parts.length - 1];
    const ho = parts[0];
    const tenDem = parts.slice(1, parts.length - 1);
    const randomNum = Math.floor(Math.random() * 1000);
    const variations = [
      `${ten}${ho.charAt(0)}${randomNum}`,
      `${ho}${ten.charAt(0)}${tenDem.join('')}${randomNum}`,
      `${ten}${tenDem.join('')}${ho.charAt(0)}${randomNum}`
    ];
    let username = variations[Math.floor(Math.random() * variations.length)];
    username = this.removeVietnameseDiacritics(username);
    username = this.makeUniqueUsername(username);
    this.accountForm.get('username')?.setValue(username, { emitEvent: false });
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
    while (this.accounts.some(account => account.username?.toLowerCase() === username.toLowerCase())) {
      username = `${baseUsername}${counter++}`;
    }
    return username;
  }

  saveAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng kiểm tra và điền đầy đủ các trường hợp lệ.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = this.accountForm.value;
    this.accountService.createNhanVien(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          Swal.fire({
            title: 'Thành công',
            text: response.message,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.accountAdded.emit(response.data);
            this.closeModal();
          });
        } else {
          Swal.fire({
            title: 'Lỗi',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (error: any) => {
        const message = error.status === 400
          ? error.error.message || 'Dữ liệu không hợp lệ.'
          : 'Lỗi hệ thống. Vui lòng thử lại.';
        Swal.fire({
          title: 'Lỗi',
          text: message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

   closeModal() {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    // Robust modal cleanup
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
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
    }, 100);
  }
}