import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../service/token.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.tokenService.getToken();
    const role = this.tokenService.getRole();

    if (token && !this.tokenService.isTokenExpired()) {
      if (!token || this.tokenService.isTokenExpired()) {
        // Nếu chưa đăng nhập hoặc token hết hạn, chuyển hướng đến trang login
        this.router.navigate(['/login']);
        return false;
      }
      else if (role === 'USER' && state.url === '/admin') {
        this.router.navigate(['/']);
        return false;
      } else if (role === 'ADMIN' && state.url === '/') {
        this.router.navigate(['/admin']);
        return false;
      }
      return true; // Truy cập được phép
    }

    this.router.navigate(['/login']);
    return false;
  }
}
