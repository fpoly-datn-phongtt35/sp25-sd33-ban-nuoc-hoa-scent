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
  showPassword: boolean = false;

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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response: string) => {
          // Kiểm tra phản hồi từ API
          if (response === 'fail' || response === 'Sai mật khẩu hoặc tài khoản không tồn tại') {
            // Sai tài khoản hoặc mật khẩu
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
          } else if (response === 'Tài khoản đã bị khóa') {
            // Tài khoản bị khóa
            Swal.fire({
              icon: 'error',
              title: 'Đăng nhập thất bại',
              text: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!',
              confirmButtonText: 'OK',
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
          } else {
            // Đăng nhập thành công (response là token)
            try {
              this.tokenService.setToken(response);
              const role = this.tokenService.getRole();
              const UserID: number = this.tokenService.getUserId();
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
          }
        },
        error: (error: any) => {
          console.error('Lỗi kết nối API đăng nhập:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi hệ thống',
            text: 'Không thể kết nối đến server. Vui lòng thử lại sau!',
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
        },
      });
    }
  }
}