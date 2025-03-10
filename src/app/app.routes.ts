import { Routes } from '@angular/router';
import { HomeAdminComponent } from './admin/home-admin/home-admin.component';
import { ProductAdminComponent } from './admin/product-admin/product-admin.component';
import { AdminGuard } from './Guard/adminGuard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductComponent } from './product/product.component';
import { RegisterComponent } from './register/register.component';
// import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
// import { ContactComponent } from './contact/contact.component';
// import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Trang chủ
  { path: 'product', component: ProductComponent }, // Trang sản phẩm
  { path: 'app-order', component: OrderComponent },
  { path: 'register', component: RegisterComponent }, // Trang sản phẩm
  { path: 'product_detail', component: ProductDetailComponent }, // Chi tiết sản phẩm
  { path: 'register', component: RegisterComponent }, // Đăng ký
  {
    path: 'admin',
    component: HomeAdminComponent,
    canActivate: [AdminGuard], // Chỉ admin được truy cập
  },
  {
    path: 'product_admin',
    component: ProductAdminComponent,
    canActivate: [AdminGuard], // Chỉ admin được truy cập
  },
  { path: 'login', component: LoginComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
];

