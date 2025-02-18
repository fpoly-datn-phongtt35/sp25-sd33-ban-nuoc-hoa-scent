import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Thêm import withFetch
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), // Cấu hình HttpClient với Fetch API
    provideZoneChangeDetection({ eventCoalescing: true }), // Tối ưu Zone.js
    provideRouter(routes), // Cấu hình router
    provideClientHydration() // Hỗ trợ SSR hydration
  ]
};
