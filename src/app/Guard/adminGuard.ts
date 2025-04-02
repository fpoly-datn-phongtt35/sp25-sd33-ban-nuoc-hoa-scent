import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Console } from 'console';
import { TokenService } from '../service/token.service';
 // Đường dẫn đúng đến TokenService

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(): boolean {
    const role = this.tokenService.getRole();
    console.log('Vai trò người dùng trong AdminGuard:', role);
    if (role === 'ADMIN' || role === 'STAFF') {
      console.log('Người dùng là admin. Cho phép truy cập.');
      return true;
    } else {
      console.log('Người dùng không phải admin. Điều hướng về trang chủ.');
      this.router.navigate(['/']); // Điều hướng về trang chủ
      return false;
    }
  }
  
  
}
