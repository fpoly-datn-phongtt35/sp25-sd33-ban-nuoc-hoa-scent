import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
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
  constructor(private router: Router, private tokenService: TokenService,private cartService: CartService) {
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
      this.username = userInfo?.sub || null; // Sử dụng 'sub' nếu username được lưu ở đây
    } else {
      this.isLoggedIn = false;
      this.username = null;
    }
  }

  // Chuyển đến trang login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Đăng xuất
  logout(): void {
    const token = this.tokenService.getToken();
  
    if (token) {
      const confirmLogout = confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmLogout) {
        this.tokenService.removeToken();
  
        // Xóa thông tin người dùng khỏi client
        this.cartService.setUserId(null);
        
        // Làm trống giỏ hàng trên client nhưng không xóa từ localStorage
        this.cartService.clearCartOnClient();
  
        alert('Bạn đã đăng xuất thành công!');
        this.router.navigate(['/login']);
      }
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }
  
  
  
}
