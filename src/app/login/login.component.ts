import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: loginService,
    private tokenService: TokenService,
    private router: Router,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Lấy dữ liệu từ queryParams hoặc state
    const state = this.route.snapshot.queryParams['state'];
    if (state) {
      try {
        const parsedState = JSON.parse(state) as { username: string };
        if (parsedState && parsedState.username) {
          this.loginForm.patchValue({
            username: parsedState.username,
          });
        }
      } catch (error) {
        console.error('[LoginComponent] Lỗi khi parse state:', error);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (token: string) => {
          console.log('Token nhận được:', token);
          try {
            this.tokenService.setToken(token);
            const role = this.tokenService.getRole();
            console.log('Vai trò sau khi đăng nhập:', role);
            const UserID: number = this.tokenService.getUserId();
            console.log('ID:', UserID);
            if (UserID) {
              this.cartService.setUserId(UserID.toString());
            } else {
              throw new Error('Không lấy được UserID từ token');
            }

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
                htmlContainer: 'swal2-content',
                confirmButton: 'swal2-confirm',
              },
              timer: 3000,
              timerProgressBar: true,
              backdrop: true,
              allowOutsideClick: true,
            }).then(() => {
              if (role === 'ADMIN' || role === 'STAFF') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/']);
              }
            });
          } catch (error) {
            console.error('Lỗi khi xử lý token sau đăng nhập:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi đăng nhập',
              text: 'Không thể lưu thông tin đăng nhập do bộ nhớ trình duyệt đầy. Vui lòng xóa dữ liệu trình duyệt và thử lại!',
              confirmButtonText: 'Thử lại',
              position: 'center',
              customClass: {
                popup: 'swal2-centered',
                icon: 'swal2-icon',
                title: 'swal2-title',
                htmlContainer: 'swal2-content',
                confirmButton: 'swal2-confirm',
              },
              timer: 5000,
              timerProgressBar: true,
              backdrop: true,
              allowOutsideClick: true,
            });
          }
        },
        error: (error: any) => {
          console.error('Đăng nhập thất bại', error);
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