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
    
    if (role === 'ADMIN' || role === 'STAFF') {
     
      return true;
    } else {
      
      this.router.navigate(['/']); // Điều hướng về trang chủ
      return false;
    }
  }
  
  
}
