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
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      hoTen: ['', [
        Validators.required, 
        Validators.minLength(3), 
        this.noMultipleWhitespaceValidator(), 
        this.noSpecialCharactersValidator(), 
        this.requireLettersValidator()
      ]],
      email: ['', [Validators.required, Validators.email, this.noWhitespaceValidator()]],
      sdt: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), this.noWhitespaceValidator()]],
      tenDangNhap: ['', [Validators.required, Validators.minLength(3), this.noWhitespaceValidator()]],
      matKhau: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator(), this.noWhitespaceValidator()]],
      xacNhanMatKhau: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator(), this.noWhitespaceValidator()]],
    }, { validators: this.checkPasswords });
  }

  // Validator kiểm tra không có nhiều dấu cách liên tiếp
  noMultipleWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const hasMultipleWhitespace = /\s{2,}/.test(value); // Kiểm tra 2 hoặc nhiều dấu cách liên tiếp
      const isOnlyWhitespace = /^\s*$/.test(value); // Kiểm tra nếu chỉ có dấu cách
      return hasMultipleWhitespace || isOnlyWhitespace ? { multipleWhitespace: true } : null;
    };
  }

  // Validator kiểm tra không có ký tự đặc biệt
  noSpecialCharactersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      // Cho phép chữ cái (bao gồm chữ cái có dấu tiếng Việt), dấu cách, và không cho phép ký tự đặc biệt
      const hasSpecialCharacters = /[^a-zA-Z\s\u00C0-\u1EF9]/.test(value);
      return hasSpecialCharacters ? { specialCharacters: true } : null;
    };
  }

  // Validator yêu cầu ít nhất một chữ cái
  requireLettersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      // Kiểm tra xem có ít nhất một chữ cái (bao gồm chữ cái có dấu tiếng Việt)
      const hasLetters = /[a-zA-Z\u00C0-\u1EF9]/.test(value);
      return !hasLetters ? { noLetters: true } : null;
    };
  }

  // Validator kiểm tra không có dấu cách
  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const hasWhitespace = /\s/.test(value); // Kiểm tra dấu cách bằng regex
      return hasWhitespace ? { whitespace: true } : null;
    };
  }

  // Validator kiểm tra độ mạnh của mật khẩu
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (!value) {
        return null; // Để Validators.required xử lý trường hợp trống
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const valid = hasUpperCase && hasLowerCase && hasSpecialChar;

      return valid ? null : { passwordStrength: true };
    };
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

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