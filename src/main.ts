// Polyfill for 'global' in the browser
(window as any).global = window;
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideToastr } from 'ngx-toastr'; // Thêm provider cho Toastr

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      HttpClientModule, // Thêm HttpClientModule
      BrowserAnimationsModule // Cần thiết cho Toastr
    ),
    provideCharts(withDefaultRegisterables()), // Đặt trực tiếp trong providers
    provideToastr({ // Cấu hình Toastr
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
}).catch((err: any) => console.error(err));