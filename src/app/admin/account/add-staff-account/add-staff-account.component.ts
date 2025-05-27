import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
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
    private cdr: ChangeDetectorRef
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

    // Validator cho email (local check)
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

    // Validator cho username
    const usernameValidator: ValidatorFn = (control: AbstractControl) => {
      const value = control.value?.trim();
      if (!value) return { required: true };
      if (value.length === 0) return { onlyWhitespace: true };
      return null;
    };

    this.accountForm = this.fb.group({
      hoTen: ['', hoTenValidator],
      email: ['', [Validators.required, Validators.email, emailExistsValidator], [this.emailAsyncValidator.bind(this)]],
      soDienThoai: ['', [sdtValidator], [this.phoneNumberAsyncValidator.bind(this)]],
      username: ['', [usernameValidator], [this.usernameAsyncValidator.bind(this)]]
    });
  }

  ngOnInit(): void {
    // Tự động tạo username khi hoTen thay đổi
    this.hoTenSubscription = this.accountForm.get('hoTen')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && this.accountForm.get('hoTen')?.valid) {
        const generatedUsername = this.generateUsername(value);
        this.accountForm.get('username')?.setValue(generatedUsername, { emitEvent: true });
      } else {
        this.accountForm.get('username')?.setValue('', { emitEvent: false });
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.hoTenSubscription?.unsubscribe();
  }

  // Async validator cho email
emailAsyncValidator(control: AbstractControl) {
  const email = control.value?.trim();
  if (!email) return of(null);
  return this.accountService.findByEmail(email).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map(response => {
      console.log('Email API response:', response);
      return response.success ? { emailExists: true } : null; // Đảo ngược logic
    }),
    catchError((error) => {
      console.warn('Email check failed:', error.message);
      return of(null); // Trả về null nếu API lỗi
    })
  );
}

  // Async validator cho số điện thoại
  phoneNumberAsyncValidator(control: AbstractControl) {
    const sdt = control.value?.trim();
    if (!sdt) return of(null);
    return this.accountService.findByPhoneNumber(sdt).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(response => {
        console.log('Phone API response:', response); // Debug response
        return response.success ? null : { sdtExists: true };
      }),
      catchError((error) => {
        console.warn('Phone check failed:', error.message); // Debug lỗi
        return of({ sdtExists: false });
      })
    );
  }

  // Async validator cho username
  usernameAsyncValidator(control: AbstractControl) {
    const username = control.value?.trim();
    if (!username) return of(null);
    return this.accountService.findByUsername(username).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(response => {
        console.log('Username API response:', response); // Debug response
        return response && Object.keys(response).length > 0 ? { usernameExists: true } : null;
      }),
      catchError((error) => {
        console.warn('Username check failed:', error.message); // Debug lỗi
        return of(null); // Trả về null nếu API lỗi
      })
    );
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
    if (!hoTen || this.accountForm.get('hoTen')?.invalid) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng nhập họ và tên hợp lệ trước khi tạo tên đăng nhập ngẫu nhiên.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const normalized = hoTen.trim().toLowerCase().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');
    if (parts.length < 2) return;

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

    // Kiểm tra username với backend trước khi set
    this.accountService.findByUsername(username).subscribe({
      next: (response) => {
        if (!response || Object.keys(response).length === 0) {
          this.accountForm.get('username')?.setValue(username, { emitEvent: true });
        } else {
          // Nếu username đã tồn tại, thử thêm số ngẫu nhiên khác
          const newUsername = `${username}${Math.floor(Math.random() * 100)}`;
          this.accountService.findByUsername(newUsername).subscribe({
            next: (newResponse) => {
              this.accountForm.get('username')?.setValue(
                !newResponse || Object.keys(newResponse).length === 0 ? newUsername : `${newUsername}${Math.floor(Math.random() * 100)}`,
                { emitEvent: true }
              );
              this.cdr.detectChanges();
            },
            error: () => {
              this.accountForm.get('username')?.setValue(newUsername, { emitEvent: true });
              this.cdr.detectChanges();
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.accountForm.get('username')?.setValue(username, { emitEvent: true });
        this.cdr.detectChanges();
      }
    });
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
    if (this.accountForm.invalid || this.accountForm.pending) {
      this.accountForm.markAllAsTouched();
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng kiểm tra và điền đầy đủ các trường hợp lệ.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = {
      hoTen: this.accountForm.get('hoTen')?.value.trim(),
      email: this.accountForm.get('email')?.value.trim(),
      soDienThoai: this.accountForm.get('soDienThoai')?.value.trim(),
      username: this.accountForm.get('username')?.value.trim()
    };

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

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) modalElement.remove();
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
    }, 100);
  }
}