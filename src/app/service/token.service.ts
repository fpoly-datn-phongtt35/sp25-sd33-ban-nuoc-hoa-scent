import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private jwtHelper = new JwtHelperService();

  constructor() {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  

  getToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('Token từ localStorage:', token);
      return token ? token : null;
    }
    console.warn('localStorage is not available');
    return null;
  }

  setToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      console.log('Lưu token:', token);
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      console.warn('localStorage is not available');
    }
  }

  removeToken(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } else {
      console.warn('localStorage is not available');
    }
  }

  setUser(user: any): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      console.warn('localStorage is not available');
    }
  }

  getUserId(): number {
    if (this.isLocalStorageAvailable()) {
      const user = localStorage.getItem(this.USER_KEY);
      if (!user) {
        console.warn('Không tìm thấy thông tin người dùng');
        return 0;
      }
      try {
        const userObject = JSON.parse(user);
        return userObject?.id ?? 0;
      } catch (error) {
        console.error('Lỗi khi giải mã thông tin người dùng:', error);
        return 0;
      }
    }
    console.warn('localStorage is not available');
    return 0;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      console.warn('Token không tồn tại hoặc rỗng');
      return true;
    }
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Lỗi khi kiểm tra token hết hạn:', error);
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const userId = this.getUserId();
    if (token && !this.isTokenExpired() && userId > 0) {
      return true;
    }
    return false;
  }

  // Lấy thông tin người dùng từ token
  getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return null;
      }
    }
    console.warn('Token không tồn tại hoặc rỗng.');
    return null;
  }

  // Lấy vai trò người dùng từ token
  getRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.warn('Token không tồn tại.');
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload
      console.log('Vai trò từ token:', payload.role);
      return payload.role || null;
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  }
  
  
}
