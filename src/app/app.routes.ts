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
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { ContactComponent } from './contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'product', component: ProductComponent },
  { path: 'app-order', component: OrderComponent },
  { path: 'product/detail/:id', component: ProductDetailComponent },
  { path: 'app-order-id', component: OrderDetailUserIDComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'product_detail', component: ProductDetailComponent },
  { path: 'admin', component: HomeAdminComponent, canActivate: [AdminGuard] },
  { path: 'order-success/:orderId', component: OrderSuccessComponent },
  { path: 'order-details/:id', component: OrderDetailComponent },
  { path: 'product_admin', component: ProductAdminComponent, canActivate: [AdminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'account-info', component: AccountInfoComponent }, // Route mới cho thông tin tài khoản
];
