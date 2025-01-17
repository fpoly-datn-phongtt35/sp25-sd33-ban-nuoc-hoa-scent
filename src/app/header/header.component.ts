import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { ToastrService } from 'ngx-toastr';

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
  constructor(private router: Router, private tokenService: TokenService,private toastr: ToastrService) {
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
      // Xóa token
      this.tokenService.removeToken();
  
      // Hiển thị thông báo thành công
      this.toastr.success('Bạn đã đăng xuất thành công!', 'Thông báo', {
        timeOut: 2000, // Thời gian hiển thị thông báo
      });
  
      // Điều hướng sau khi thông báo hiển thị
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000); // Trì hoãn 2 giây trước khi chuyển trang
    } else {
      // Nếu không có token, hiển thị cảnh báo
      this.toastr.warning('Bạn chưa đăng nhập!', 'Thông báo');
    }
  }
  
}
