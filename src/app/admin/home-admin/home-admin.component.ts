import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductAdminComponent } from '../product-admin/product-admin.component';
import { CommonModule } from '@angular/common'; 
import { UserAdminComponent } from '../user-admin/user-admin.component';
import { CustomerComponent } from '../customer/customer.component';
import { VourcherComponent } from '../vourcher/vourcher.component';
import { StatisticsComponent } from '../statistics/statistics.component';
import { InvoiceComponent } from '../invoice/invoice.component';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../service/token.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [RouterModule,ProductAdminComponent,CommonModule,UserAdminComponent,CustomerComponent,VourcherComponent,StatisticsComponent,InvoiceComponent],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.scss'
})
export class HomeAdminComponent {
  selectedComponent: string = 'dashboard';  // Mặc định hiển thị trang dashboard
  selectedNav: string = 'dashboard';  // Điều khiển mục active trên sidebar
  constructor(
  
    private tokenService: TokenService,
    private toastr: ToastrService ,
    private router: Router
  ){}
  showComponent(component: string) {
    this.selectedComponent = component;
    this.selectedNav = component;
  }

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
