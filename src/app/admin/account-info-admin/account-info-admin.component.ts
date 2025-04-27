import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../service/taikhoan.service';
import { TokenService } from '../../service/token.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-account-info-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-info-admin.component.html',
  styleUrls: ['./account-info-admin.component.scss'],
})
export class AccountInfoAdminComponent implements OnInit, OnDestroy {
  userInfo: any = {};
  updateForm: FormGroup;
  showModal: boolean = true;
  private emailSubscription?: Subscription;

  constructor(
    private accountService: AccountService,
    private tokenService: TokenService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.updateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      hoTen: ['', Validators.required],
      sdt: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.setupEmailValidation();
  }

  loadUserInfo(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired()) {
      const username = this.tokenService.getUserInfo()?.sub;
      if (username) {
        this.accountService.findByUsername(username).subscribe({
          next: (data) => {
            this.userInfo = data;
            this.updateForm.patchValue({
              email: data.email,
              hoTen: data.hoTen,
              sdt: data.sdt,
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Lỗi khi lấy thông tin tài khoản:', err);
            alert('Không thể tải thông tin tài khoản!');
          },
        });
      }
    }
  }

  setupEmailValidation(): void {
    this.emailSubscription = this.updateForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || !this.updateForm.get('email')?.valid) {
          return of(null);
        }
        // Cho phép giữ email hiện tại của người dùng
        if (email === this.userInfo.email) {
          return of(null);
        }
        return this.accountService.findByEmail(email).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(response => {
      const emailControl = this.updateForm.get('email');
      if (response && response.email !== this.userInfo.email) {
        emailControl?.setErrors({ duplicateEmail: true });
      } else {
        if (emailControl?.errors && emailControl.errors['duplicateEmail']) {
          const { duplicateEmail, ...otherErrors } = emailControl.errors;
          emailControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
      this.cdr.detectChanges();
    });
  }

  updateAccount(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const updatedInfo = {
      ...this.userInfo,
      email: this.updateForm.get('email')?.value,
      hoTen: this.updateForm.get('hoTen')?.value,
      sdt: this.updateForm.get('sdt')?.value,
    };

    this.accountService.updateAccount(updatedInfo).subscribe({
      next: () => {
        alert('Cập nhật thông tin tài khoản thành công!');
        this.closeModal();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật tài khoản:', err);
        alert('Cập nhật thông tin thất bại!');
      },
    });
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    this.finalizeModalClose();
  }

  private finalizeModalClose(): void {
    document.body.classList.remove('modal-open');

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      modal.classList.remove('show');
      modal.remove();
    });

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.emailSubscription?.unsubscribe();
  }
}
