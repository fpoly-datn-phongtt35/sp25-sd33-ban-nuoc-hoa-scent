import { bootstrapApplication } from '@angular/platform-browser';
import { HomeAdminComponent } from './app/admin/home-admin/home-admin.component';// trang admin

import { AppComponent } from './app/app.component';// trang bán hàng
import { config } from './app/app.config.server';
import { HomeComponent } from './app/home/home.component';
import { LoginComponent } from './app/login/login.component';
import { OrderComponent } from './app/order/order.component';
import { ProductDetailComponent } from './app/product-detail/product-detail.component';
import { ProductComponent } from './app/product/product.component';
import { RegisterComponent } from './app/register/register.component';

const bootstrap = () => bootstrapApplication(AppComponent, config); // (HomeAdminComponent) cái này phải giống ở file main.ts

export default bootstrap;
