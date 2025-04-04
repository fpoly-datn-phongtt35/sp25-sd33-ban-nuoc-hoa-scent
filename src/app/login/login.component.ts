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
  imports: [ReactiveFormsModule, CommonModule, RouterModule], // Đảm bảo RouterModule có trong imports
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

          Swal.fire({
            title: 'Đăng nhập thành công!',
            text: 'Chào mừng bạn đến với hệ thống!',
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'bottom-end',
            timer: 3000,
          });

          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'STAFF') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {
          console.error('Đăng nhập thất bại', error);
          Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại',
            text: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại!',
            confirmButtonText: 'Thử lại',
            position: 'bottom-end',
            timer: 3000,
            customClass: {
              popup: 'swal2-popup',
              icon: 'swal2-icon',
              title: 'swal2-title',
            },
          });
        },
      });
    }
  }
}
