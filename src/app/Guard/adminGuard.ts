import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { TokenService } from '../token.service';
import { UserService } from '../user.service';
import { UserResponse } from '../../responses/user/user.reponse';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;
    const userResponse: UserResponse | null = this.userService.getUserResponseFromLocalStorage();
    const isAdmin = userResponse?.role.name === 'ADMIN';

    if (!isTokenExpired && isUserIdValid && isAdmin) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
