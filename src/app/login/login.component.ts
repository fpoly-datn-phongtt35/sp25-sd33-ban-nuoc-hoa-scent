import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../service/token.service';
import { loginService } from '../service/login';
import { CartService } from '../service/cart.Service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: loginService,
    private tokenService: TokenService,
    private router: Router,
    private cartService: CartService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (token: string) => {
          console.log('Token nhận được:', token);
          this.tokenService.setToken(token);
          const role = this.tokenService.getRole();
          console.log('Vai trò sau khi đăng nhập:', role);
          const UserID: number = this.tokenService.getUserId();
          console.log('ID:', UserID);
          this.cartService.setUserId(UserID.toString());

          // Centered success notification with correct icon and customClass
          Swal.fire({
            title: 'Đăng nhập thành công!',
            text: 'Chào mừng bạn đến với hệ thống!',
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            customClass: {
              popup: 'swal2-centered',
              icon: 'swal2-icon',
              title: 'swal2-title',
              htmlContainer: 'swal2-content', // Changed 'content' to 'htmlContainer'
              confirmButton: 'swal2-confirm',
            },
            timer: 3000,
            timerProgressBar: true,
            backdrop: true,
            allowOutsideClick: true,
          }).then(() => {
            // Navigate after the notification closes
            if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (role === 'STAFF') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/']);
            }
          });
        },
        error: (error: any) => {
          console.error('Đăng nhập thất bại', error);
          // Centered error notification with correct icon and customClass
          Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại',
            text: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại!',
            confirmButtonText: 'Thử lại',
            position: 'center',
            customClass: {
              popup: 'swal2-centered',
              icon: 'swal2-icon',
              title: 'swal2-title',
              htmlContainer: 'swal2-content', // Changed 'content' to 'htmlContainer'
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
