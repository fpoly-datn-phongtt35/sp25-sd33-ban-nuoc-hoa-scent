import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService,private router: Router) { 
    this.registerForm = this.fb.group({
      hoTen: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      tenDangNhap: ['', [Validators.required, Validators.minLength(3)]],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
      xacNhanMatKhau: ['', Validators.required]
    }, { validators: this.checkPasswords });
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('matKhau')?.value;
    const confirmPass = group.get('xacNhanMatKhau')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.userService.register(this.registerForm.value).subscribe({
        next: (data: any) => {
          console.log('Registration successful', data);
          alert('Đăng ký thành công');
          this.router.navigate(['/login']); // Điều hướng đến trang đăng nhập sau khi đăng ký thành công
        },
        error: (error: any) => {
          console.error('Registration failed', error);
        }
      });
    }
  }
}
