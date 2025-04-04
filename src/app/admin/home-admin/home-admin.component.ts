import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal
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
  ],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'],
})
export class HomeAdminComponent implements OnInit, OnDestroy {
  selectedComponent: string = 'invoice';
  selectedNav: string = 'invoice';
  userRole: string | null = null;
  tenDangNhap: any = null;
  userID: number | null = null;
  isDropdownVisible: boolean = false;

  constructor(
    private tokenService: TokenService,
    private accountService: AccountService,
    private router: Router,
    private modalService: NgbModal // Inject NgbModal
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
      this.router.navigate(['/admin']);
    } else {
      console.error('Vai trò không hợp lệ, điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
  }

  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    console.log('Vai trò hiện tại khi nhấn vào menu:', role);

    if (role === 'ADMIN' || role === 'STAFF') {
      this.selectedComponent = component;
      this.selectedNav = component;
      console.log(`Hiển thị component: ${component}`);
    } else {
      console.error('Người dùng không phải admin. Điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
  }

  showDropdown(): void {
    this.isDropdownVisible = true;
  }

  hideDropdown(): void {
    this.isDropdownVisible = false;
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
      alert('Bạn đã đăng xuất thành công!');
      this.router.navigate(['/login']);
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }

  ngOnDestroy(): void {}
}
