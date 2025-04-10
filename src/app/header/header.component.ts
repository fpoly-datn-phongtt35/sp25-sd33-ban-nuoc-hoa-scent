
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordModalComponent } from '../change-password/change-password.component';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { CartService } from '../service/cart.Service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ShoppingCartComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isShoppingCartOpen: boolean = false;
  isLoggedIn: boolean = false;
  username: string | null = null;
  isDropdownOpen: boolean = false;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private cartService: CartService,
    private modalService: NgbModal
  ) {
    this.checkLoginStatus();
  }

  toggleShoppingCart() {
    this.isShoppingCartOpen = !this.isShoppingCartOpen;
  }

  closeShoppingCart() {
    this.isShoppingCartOpen = false;
  }

  checkLoginStatus(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired()) {
      this.isLoggedIn = true;
      const userInfo = this.tokenService.getUserInfo();
      this.username = userInfo?.sub || null;
    } else {
      this.isLoggedIn = false;
      this.username = null;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    const token = this.tokenService.getToken();
    if (token) {
      const confirmLogout = confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmLogout) {
        this.tokenService.removeToken();
        this.cartService.setUserId(null);
        this.checkLoginStatus(); // Call this to update the login status
        alert('Bạn đã đăng xuất thành công!');
        this.router.navigate(['/']).then(() => {
          window.location.reload(); // Optional: Force a page reload if needed
        });
      }
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }

  showDropdown(): void {
    this.isDropdownOpen = true;
  }

  hideDropdown(): void {
    this.isDropdownOpen = false;
  }

  openChangePasswordModal(): void {
    this.isDropdownOpen = false;
    const modalService = this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
}