import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
 // Thay đổi đường dẫn tùy thuộc vào cấu trúc dự án
import { TokenService } from '../service/token.service';
import { loginService } from '../service/login';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
    private toastr: ToastrService 
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response: { token: string }) => {
          if (response?.token) {
            this.tokenService.setToken(response.token);
            this.toastr.success('Đăng nhập thành công!', 'Thành công');

            const role = this.tokenService.getRole();
            if (role === 'USER') {
              this.router.navigate(['']);
            } else if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            }
          }
        },
        error: () => {
          this.toastr.error('Tên đăng nhập hoặc mật khẩu không đúng!', 'Lỗi');
        },
      });
    } else {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin!', 'Cảnh báo');
    }
  }
  
  
}
