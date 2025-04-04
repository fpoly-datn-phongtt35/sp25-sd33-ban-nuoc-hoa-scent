import { Routes } from '@angular/router';
import { HomeAdminComponent } from './admin/home-admin/home-admin.component';
import { AdminGuard } from './Guard/adminGuard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { OrderDetailUserIDComponent } from './order-detail-user-id/order-detail-user-id.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { OrderComponent } from './order/order.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductComponent } from './product/product.component';
import { RegisterComponent } from './register/register.component';
import { ProductAdminComponent } from './admin/product/product-list/product-admin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'; // Thêm import này

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Trang chủ
  { path: 'product', component: ProductComponent }, // Trang sản phẩm
  { path: 'app-order', component: OrderComponent },
  { path: 'product/detail/:id', component: ProductDetailComponent },
  { path: 'app-order-id', component: OrderDetailUserIDComponent },
  { path: 'register', component: RegisterComponent }, // Đăng ký (đã loại bỏ route trùng lặp)
  { path: 'product_detail', component: ProductDetailComponent }, // Chi tiết sản phẩm
  { path: 'admin', component: HomeAdminComponent, canActivate: [AdminGuard] }, // Chỉ admin được truy cập
  { path: 'order-success/:orderId', component: OrderSuccessComponent },
  { path: 'order-details/:id', component: OrderDetailComponent },
  { path: 'product_admin', component: ProductAdminComponent, canActivate: [AdminGuard] }, // Chỉ admin được truy cập
  { path: 'login', component: LoginComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
  { path: 'product/:id', component: ProductDetailComponent }, // Định tuyến chi tiết sản phẩm
  { path: 'forgot-password', component: ForgotPasswordComponent }, // Thêm route cho quên mật khẩu
];
