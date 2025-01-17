import { Routes } from '@angular/router';
import { HomeAdminComponent } from './admin/home-admin/home-admin.component';
import { ProductAdminComponent } from './admin/product-admin/product-admin.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductComponent } from './product/product.component';
import { RegisterComponent } from './register/register.component';
// import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
// import { ContactComponent } from './contact/contact.component';
// import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Trang chủ
  { path: 'product', component: ProductComponent }, // Trang sản phẩm
  { path: 'product_detail', component: ProductDetailComponent }, // Trang sản phẩm
  { path: 'product_admin', component:  ProductAdminComponent},
  { path: 'register', component: RegisterComponent },  // Điều hướng đến trang đăng ký
  { path: 'admin', component: HomeAdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
  // { path: 'shopping_cart', component: ShoppingCartComponent },
//   { path: 'lien-he', component: ContactComponent }, // Trang liên hệ
//   { path: '**', component: NotFoundComponent }, // Trang "Không tìm thấy"
];
