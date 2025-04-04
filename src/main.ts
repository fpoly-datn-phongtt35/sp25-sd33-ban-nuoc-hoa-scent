import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Đường dẫn đúng tới routes
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      HttpClientModule, // Thêm HttpClientModule
      BrowserAnimationsModule // Cần thiết cho Toastr
    ),
    provideCharts(withDefaultRegisterables()) // Đặt trực tiếp trong providers
  ],
}).catch((err: any) => console.error(err));