import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../service/user.service';
import { AccountService } from '../service/taikhoan.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  private subscriptions: Subscription[] = [];
  showPassword: boolean = false; // Biến điều khiển hiển thị/ẩn mật khẩu
  showConfirmPassword: boolean = false; // Biến điều khiển hiển thị/ẩn xác nhận mật khẩu

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      hoTen: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      tenDangNhap: ['', [Validators.required, Validators.minLength(3)]],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
      xacNhanMatKhau: ['', Validators.required],
    }, { validators: this.checkPasswords });
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('matKhau')?.value;
    const confirmPass = group.get('xacNhanMatKhau')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  ngOnInit(): void {
    const emailSubscription = this.registerForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || !this.registerForm.get('email')?.valid) {
          return of(null);
        }
        return this.accountService.findByEmail(email).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(response => {
      const emailControl = this.registerForm.get('email');
      if (response) {
        emailControl?.setErrors({ duplicateEmail: true });
      } else {
        if (emailControl?.errors && emailControl.errors['duplicateEmail']) {
          const { duplicateEmail, ...otherErrors } = emailControl.errors;
          emailControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
    });

    const usernameSubscription = this.registerForm.get('tenDangNhap')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(username => {
        if (!username || !this.registerForm.get('tenDangNhap')?.valid) {
          return of(null);
        }
        return this.accountService.findByUsername(username).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(response => {
      const usernameControl = this.registerForm.get('tenDangNhap');
      if (response) {
        usernameControl?.setErrors({ duplicateUsername: true });
      } else {
        if (usernameControl?.errors && usernameControl.errors['duplicateUsername']) {
          const { duplicateUsername, ...otherErrors } = usernameControl.errors;
          usernameControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
    });

    this.subscriptions.push(emailSubscription, usernameSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Hàm để bật/ẩn mật khẩu
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Hàm để bật/ẩn xác nhận mật khẩu
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const emailControl = this.registerForm.get('email');
      const usernameControl = this.registerForm.get('tenDangNhap');
      if (emailControl?.errors?.['duplicateEmail'] || usernameControl?.errors?.['duplicateUsername']) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Vui lòng sửa các lỗi trước khi đăng ký!',
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

      this.userService.register(this.registerForm.value).subscribe({
        next: (data: any) => {
          console.log('Registration successful', data);
          Swal.fire({
            title: 'Thành công',
            text: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
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
            this.router.navigate(['/login'], {
              state: {
                username: this.registerForm.get('tenDangNhap')?.value
              }
            });
          });
        },
        error: (error: any) => {
          console.error('Registration failed', error);
          Swal.fire({
            title: 'Lỗi',
            text: 'Đăng ký thất bại. Vui lòng thử lại sau!',
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
  }
}