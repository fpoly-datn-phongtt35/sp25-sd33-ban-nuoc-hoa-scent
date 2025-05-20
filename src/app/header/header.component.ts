import { Component, EventEmitter, Input, Output, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordModalComponent } from '../change-password/change-password.component';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { CartService } from '../service/cart.Service';
import { ThongbaoComponent } from '../thongbao/thongbao.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ShoppingCartComponent, FormsModule, ThongbaoComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() query: string = '';
  @Output() queryChange = new EventEmitter<string>();
  @ViewChild(ThongbaoComponent, { static: false }) thongbaoComponent: ThongbaoComponent | undefined;

  isShoppingCartOpen: boolean = false;
  isLoggedIn: boolean = false;
  username: string | null = null;
  isDropdownOpen: boolean = false;
  isHomePage: boolean = true;
  cartItemCount: number = 0;
  isNotificationOpen: boolean = false; // Khởi tạo là false

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private cartService: CartService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.checkLoginStatus();
    this.checkRoute();
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }

  ngOnInit(): void {
    this.cartItemCount = this.cartService.getCartItemCountValue();
    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  checkRoute(): void {
    this.isHomePage = this.router.url === '/';
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
        this.checkLoginStatus();
        alert('Bạn đã đăng xuất thành công!');
        this.router.navigate(['/']).then(() => {
          window.location.reload();
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
    this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  ngAfterViewInit() {
    console.log('ThongbaoComponent:', this.thongbaoComponent);
    if (!this.thongbaoComponent) {
      console.error('ThongbaoComponent is not initialized. Check rendering and imports.');
    } else {
      console.log('ThongbaoComponent initialized successfully:', this.thongbaoComponent.unreadCount);
      this.cdr.detectChanges();
    }
  }

  onSearchChange(newQuery: string): void {
    this.queryChange.emit(newQuery);
  }

  toggleNotification() {
    this.isNotificationOpen = !this.isNotificationOpen;
    console.log('Toggling notification, isNotificationOpen:', this.isNotificationOpen);
    if (this.thongbaoComponent) {
      this.thongbaoComponent.togglePopup(this.isNotificationOpen);
      console.log('ThongbaoComponent showPopup:', this.thongbaoComponent.showPopup);
      console.log('ThongbaoComponent notifications:', this.thongbaoComponent.notifications);
      this.cdr.detectChanges();
    } else {
      console.error('ThongbaoComponent is undefined. Check rendering.');
    }
  }

  closeNotification() {
    this.isNotificationOpen = false;
    if (this.thongbaoComponent) {
      this.thongbaoComponent.togglePopup(this.isNotificationOpen);
    }
    this.cdr.detectChanges();
  }

  getUnreadCount(): number {
    return this.thongbaoComponent ? this.thongbaoComponent.unreadCount : 0;
  }
}