import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductAdminComponent } from '../product-admin/product-admin.component';
import { CommonModule } from '@angular/common';
import { UserAdminComponent } from '../user-admin/user-admin.component';
import { CustomerComponent } from '../customer/customer.component';
import { VourcherComponent } from '../vourcher/vourcher.component';
import { StatisticsComponent } from '../statistics/statistics.component';
import { InvoiceComponent } from '../invoice/invoice.component';

import { TokenService } from '../../service/token.service';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'], // Sửa từ styleUrl thành styleUrls
})
export class HomeAdminComponent implements OnInit {
  selectedComponent: string = 'dashboard'; // Mặc định hiển thị trang dashboard
  selectedNav: string = 'dashboard'; // Điều khiển mục active trên sidebar
  userRole: string | null = null; // Lưu vai trò người dùng

  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    const role = this.tokenService.getRole();
    console.log('Vai trò khi vào HomeAdminComponent:', role);

    if (role !== 'ADMIN') {
      console.error('Bạn không phải admin, điều hướng về trang chủ.');
      this.router.navigate(['/']); // Chuyển hướng nếu không phải admin
    } else {
      console.log('Người dùng là admin, tiếp tục.');
      this.selectedComponent = 'dashboard'; // Mặc định là dashboard
    }
  }


  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    console.log('Vai trò hiện tại khi nhấn vào menu11111111:', role);

    if (role === 'ADMIN') {
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
