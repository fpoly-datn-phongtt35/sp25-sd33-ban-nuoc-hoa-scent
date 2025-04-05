import { CartService } from './../service/cart.Service';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal
import { ChangePasswordModalComponent } from '../change-password/change-password.component'; // Import the ChangePasswordModalComponent

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
    private modalService: NgbModal // Inject NgbModal
  ) {
    this.checkLoginStatus();
  }

  toggleShoppingCart() {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return;
    }
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
        this.cartService.clearCartOnClient();
        alert('Bạn đã đăng xuất thành công!');
        this.router.navigate(['/login']);
      }
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }

  // Dropdown hover functionality
  showDropdown(): void {
    this.isDropdownOpen = true;
  }

  hideDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Open Change Password Modal using NgbModal
  openChangePasswordModal(): void {
    this.isDropdownOpen = false; // Close the dropdown
    const modalRef = this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
}
