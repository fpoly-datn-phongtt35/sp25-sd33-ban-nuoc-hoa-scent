import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';// trang bán hàng
import { HomeComponent } from './app/home/home.component';
import { ProductComponent } from './app/product/product.component';
import { ProductDetailComponent } from './app/product-detail/product-detail.component';
import { OrderComponent } from './app/order/order.component';
import { HomeAdminComponent } from './app/admin/home-admin/home-admin.component';// trang admin
import { RegisterComponent } from './app/register/register.component';
import { LoginComponent } from './app/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app/app.routes'; 


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Cung cấp router
    importProvidersFrom(
      HttpClientModule,
      BrowserAnimationsModule, // Cần thiết cho Toastr
      ToastrModule.forRoot({
        timeOut: 3000, // Thời gian hiển thị thông báo
        positionClass: 'toast-bottom-right', // Hiển thị ở góc dưới bên phải
        preventDuplicates: true,
        progressBar: true, // Hiển thị thanh tiến trình
      })
      ), // Cung cấp HttpClientModule toàn cục
  ],
}).catch((err: any) => console.error(err));
