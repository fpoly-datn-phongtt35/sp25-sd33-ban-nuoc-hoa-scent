import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from '../statistics/statistics.component';

import { TokenService } from '../../service/token.service';
import { Router } from '@angular/router';
import { CustomerComponent } from '../account/account-customer-list/customer.component';
import { UserAdminComponent } from '../account/account-staff-list/user-admin.component';
import { ProductAdminComponent } from '../product/product-list/product-admin.component';
import { VourcherComponent } from '../voucher/vourcher-list/vourcher.component';
import { InvoiceComponent } from '../order/order-list/invoice.component';

import { LichsuthaotacComponent } from '../../lichsuthaotac/lichsuthaotac.component';

import { OfflineOrderComponent } from '../banhangofffline/banhangofffline/banhangofffline.component';


@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    RouterModule,
    ProductAdminComponent,
    CommonModule,
    UserAdminComponent,
    CustomerComponent,
    VourcherComponent,
    StatisticsComponent,
    InvoiceComponent,

    LichsuthaotacComponent,

    OfflineOrderComponent,
],

  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'], // Sửa từ styleUrl thành styleUrls
})
export class HomeAdminComponent implements OnInit {
  selectedComponent: string = 'invoice'; // Mặc định hiển thị trang dashboard
  selectedNav: string = 'invoice'; // Điều khiển mục active trên sidebar
  userRole: string | null = null; // Lưu vai trò người dùng
  tenDangNhap: string | null = null;
  userID: number | null = null;
  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    const userInfo = this.tokenService.getUserInfo();
    this.tenDangNhap=userInfo;
    this.userID = userInfo.UserID;
    console.log('ngườI dùng vào là : ',this.tenDangNhap)
    // Lấy vai trò từ TokenService hoặc localStorage
    const role = this.tokenService.getRole(); // Hoặc lấy từ localStorage
    console.log('Vai trò người dùng:', role);
  this.userRole=role;
  console.log('Vai trò người dùng chính:', this.userRole);
    // Điều hướng dựa trên vai trò
    if (role === 'ADMIN' || role === 'STAFF') {
      this.router.navigate(['/admin']); // Điều hướng tới trang admin
    } else {
      console.error('Vai trò không hợp lệ, điều hướng về trang chủ.');
      this.router.navigate(['/']); // Điều hướng về trang chủ nếu không phải ADMIN hoặc STAFF
    }
  }


  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    console.log('Vai trò hiện tại khi nhấn vào menu11111111:', role);

    if (role === 'ADMIN' || role === 'STAFF') {
      this.selectedComponent = component; // Cập nhật component hiển thị
      console.log(`Hiển thị component: ${component}`);
    } else {
      console.error('Người dùng không phải admin. Điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
  }






  logout(): void {
    const token = this.tokenService.getToken();
    if (token) {
      // Xóa token
      this.tokenService.removeToken();

      // Hiển thị thông báo thành công
      alert('Bạn đã đăng xuất thành công!');

      // Điều hướng về trang đăng nhập
      this.router.navigate(['/login']);
    } else {
      // Nếu không có token, hiển thị cảnh báo
      alert('Bạn chưa đăng nhập!');
    }
  }
}
