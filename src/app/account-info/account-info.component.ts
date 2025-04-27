import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService } from '../service/token.service';
import { AccountService } from '../service/taikhoan.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  userInfo: any = {};
  updateForm: FormGroup;
  private emailSubscription?: Subscription;

  constructor(
    private accountService: AccountService,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.updateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      phone: [''],
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
              fullName: data.hoTen,
              phone: data.sdt,
            });
          },
          error: (err) => {
            console.error('Lỗi khi lấy thông tin tài khoản:', err);
            this.toastr.error('Không thể tải thông tin tài khoản!');
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
      hoTen: this.updateForm.get('fullName')?.value,
      sdt: this.updateForm.get('phone')?.value,
    };

    this.accountService.updateAccount(updatedInfo).subscribe({
      next: () => {
        Swal.fire({
          title: 'Thành công!',
          text: 'Cập nhật thông tin tài khoản thành công!',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          this.userInfo = updatedInfo;
          this.router.navigate(['/']); // Chuyển hướng về trang chủ
        });
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật tài khoản:', err);
        this.toastr.error('Cập nhật thông tin thất bại!');
      },
    });
  }

  ngOnDestroy(): void {
    this.emailSubscription?.unsubscribe();
  }
}
