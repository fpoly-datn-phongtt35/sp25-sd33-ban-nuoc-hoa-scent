import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
 // Thay đổi đường dẫn tùy thuộc vào cấu trúc dự án
import { TokenService } from '../service/token.service';
import { loginService } from '../service/login';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: loginService,
    private tokenService: TokenService,
    private router: Router
    
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
        next: (token: string) => {  // Directly use token as a string
          console.log('Token nhận được:', token);
          this.tokenService.setToken(token);  // Store the token
          const role = this.tokenService.getRole();  // Assume getRole reads the role from the stored token
          console.log('Vai trò sau khi đăng nhập:', role);
  
          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {
          console.error('Đăng nhập thất bại', error);
        }
      });
    }
  }
  
  
  
  
}
