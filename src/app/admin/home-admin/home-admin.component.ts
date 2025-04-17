import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StatisticsComponent } from '../statistics/statistics.component';
import { TokenService } from '../../service/token.service';
import { AccountService } from '../../service/taikhoan.service';
import { Router } from '@angular/router';
import { CustomerComponent } from '../account/account-customer-list/customer.component';
import { UserAdminComponent } from '../account/account-staff-list/user-admin.component';
import { ProductAdminComponent } from '../product/product-list/product-admin.component';
import { VourcherComponent } from '../voucher/vourcher-list/vourcher.component';
import { InvoiceComponent } from '../order/order-list/invoice.component';
import { LichsuthaotacComponent } from '../../lichsuthaotac/lichsuthaotac.component';
import { OfflineOrderComponent } from '../banhangofffline/banhangofffline/banhangofffline.component';
import { ChangePasswordModalComponent } from '../../change-password/change-password.component';
import { FragranceListComponent } from '../fragrance/fragrance-list/fragrance-list.component';
import { AccountInfoComponent } from '../../account-info/account-info.component';
import { AccountInfoAdminComponent } from '../account-info-admin/account-info-admin.component';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    RouterModule,
    ProductAdminComponent,
    CommonModule,
    FormsModule,
    UserAdminComponent,
    CustomerComponent,
    VourcherComponent,
    StatisticsComponent,
    InvoiceComponent,
    LichsuthaotacComponent,
    OfflineOrderComponent,
    FragranceListComponent,
  ],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'],
})
export class HomeAdminComponent implements OnInit, OnDestroy {
  selectedComponent: string = 'bho';
  selectedNav: string = 'bho';
  userRole: string | null = null;
  tenDangNhap: any = null;
  userID: number | null = null;
  isDropdownVisible: boolean = false;
  isComponentSwitched: boolean = false;
  isSubMenuOpen: { [key: string]: boolean } = { products: false }; // Theo dõi trạng thái đóng/mở của menu

  constructor(
    private tokenService: TokenService,
    private accountService: AccountService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const userInfo = this.tokenService.getUserInfo();
    this.tenDangNhap = userInfo;
    this.userID = userInfo?.UserID;
    console.log('Người dùng vào là: ', this.tenDangNhap);

    const role = this.tokenService.getRole();
    console.log('Vai trò người dùng:', role);
    this.userRole = role;
    console.log('Vai trò người dùng chính:', this.userRole);

    if (role === 'ADMIN' || role === 'STAFF') {
      const newSessionId = this.generateSessionId();
      localStorage.setItem('sessionId', newSessionId);
      console.log('Tạo sessionId mới khi đăng nhập:', newSessionId);
      this.router.navigate(['/admin']);
    } else {
      console.error('Vai trò không hợp lệ, điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
    this.isComponentSwitched = false;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    console.log('Vai trò hiện tại khi nhấn vào menu:', role);

    if (role === 'ADMIN' || role === 'STAFF') {
      this.selectedComponent = component;
      this.selectedNav = component;
      this.isComponentSwitched = true;
      console.log(`Hiển thị component: ${component}`);
    } else {
      console.error('Người dùng không phải admin. Điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
  }

  toggleSubMenu(menu: string): void {
    this.isSubMenuOpen[menu] = !this.isSubMenuOpen[menu];
    // Luôn hiển thị component "products" khi nhấp vào "Sản phẩm"
    if (menu === 'products') {
      this.showComponent('products');
    }
  }

  showDropdown(): void {
    this.isDropdownVisible = true;
  }

  hideDropdown(): void {
    this.isDropdownVisible = false;
  }
  openUpdateInfo():void{
    this.isDropdownVisible = false;
    const modalRef = this.modalService.open(AccountInfoAdminComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
  openChangePasswordModal(): void {
    this.isDropdownVisible = false;
    const modalRef = this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  logout(): void {
    const token = this.tokenService.getToken();
    if (token) {
      this.tokenService.removeToken();
      this.clearLocalStorage();
      this.isComponentSwitched = false;
      alert('Bạn đã đăng xuất thành công!');
      this.router.navigate(['/login']);
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }

  private clearLocalStorage(): void {
    console.log('Dữ liệu localStorage trước khi xóa:', { ...localStorage });
    localStorage.removeItem('offlineOrders');
    localStorage.removeItem('currentOrderIndex');
    localStorage.removeItem('discountCodeInput');
    localStorage.removeItem('discountDetails');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('discountMessage');
    localStorage.removeItem('totalBeforeDiscount');
    localStorage.removeItem('totalAfterDiscount');
    localStorage.removeItem('searchKeyword');
    localStorage.removeItem('filterTenNhomHuong');
    localStorage.removeItem('filterTenDanhMuc');
    localStorage.removeItem('filterTenThuongHieu');
    localStorage.removeItem('allProducts');
    localStorage.removeItem('products');
    localStorage.removeItem('nhomHuongList');
    localStorage.removeItem('danhMucList');
    localStorage.removeItem('thuongHieuList');
    localStorage.removeItem('errorMessage');
    localStorage.removeItem('isLoading');
    localStorage.removeItem('showQuantityModal');
    localStorage.removeItem('selectedProduct');
    localStorage.removeItem('selectedQuantity');
    localStorage.removeItem('cart');
    localStorage.removeItem('orderData');
    localStorage.removeItem('quantity');
    localStorage.removeItem('volume');
    localStorage.removeItem('product');

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('cart-')) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('discountUsed_')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Đã xóa tất cả dữ liệu localStorage khi đăng xuất');
    console.log('Dữ liệu localStorage sau khi xóa:', { ...localStorage });
  }

  ngOnDestroy(): void {}
}
