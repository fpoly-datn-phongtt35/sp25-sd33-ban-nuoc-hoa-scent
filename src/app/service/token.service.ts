import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from 'jwt-decode'; // Sửa import
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private jwtHelper = new JwtHelperService();
  private userInfoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      this.userInfoSubject.next(userInfo);
    }
  }

  private clearLocalStorageIfFull(): void {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      console.log('[TokenService] Tổng dung lượng localStorage:', total / 1024, 'KB');

      if (total > 4.5 * 1024 * 1024) {
        console.warn('[TokenService] Dung lượng gần đầy, tiến hành dọn dẹp...');
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key) && key !== this.TOKEN_KEY && key !== this.USER_KEY) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('[TokenService] Lỗi khi kiểm tra và dọn dẹp localStorage:', error);
      localStorage.clear();
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null;
    } catch (error) {
      console.warn('[TokenService] localStorage không khả dụng:', error);
      return false;
    }
  }

  getToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('[TokenService] Token từ localStorage:', token);
      return token ? token : null;
    }
    console.warn('[TokenService] localStorage không khả dụng');
    return null;
  }

  setToken(token: string): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('[TokenService] localStorage không khả dụng');
      return;
    }

    this.clearLocalStorageIfFull();
    try {
      console.log('[TokenService] Lưu token:', token);
      localStorage.setItem(this.TOKEN_KEY, token);
      const userInfo = this.getUserInfo();
      this.userInfoSubject.next(userInfo);
    } catch (error) {
      console.error('[TokenService] Lỗi khi lưu token:', error);
      localStorage.clear();
      localStorage.setItem(this.TOKEN_KEY, token);
      this.userInfoSubject.next(this.getUserInfo());
    }
  }

  removeToken(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this.userInfoSubject.next(null);
      console.log('[TokenService] Đã xóa token và thông tin người dùng');
    } else {
      console.warn('[TokenService] localStorage không khả dụng');
    }
  }

  setUser(user: any): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('[TokenService] localStorage không khả dụng');
      return;
    }

    this.clearLocalStorageIfFull();
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('[TokenService] Đã lưu thông tin người dùng:', user);
      this.userInfoSubject.next(user);
    } catch (error) {
      console.error('[TokenService] Lỗi khi lưu thông tin người dùng:', error);
      localStorage.removeItem(this.USER_KEY);
      this.userInfoSubject.next(null);
    }
  }

  getUserId(): number {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      console.log('[TokenService] User Info:', userInfo);
      return userInfo.UserID || 0;
    }
    console.log('[TokenService] Không lấy được user info');
    return 0;
  }

  getTenDangNhap(): string {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.tenDangNhap || '' : '';
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      console.warn('[TokenService] Token không tồn tại hoặc rỗng');
      return true;
    }
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('[TokenService] Lỗi khi kiểm tra token hết hạn:', error);
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

  getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token); // Sử dụng jwtDecode thay vì jwt_decode
        console.log('[TokenService] Payload từ token:', decoded);
        return decoded;
      } catch (error) {
        console.error('[TokenService] Lỗi khi giải mã token:', error);
        return null;
      }
    } else {
      console.log('[TokenService] Token từ localStorage: null');
      return null;
    }
  }

  getRole(): string | null {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      console.log('[TokenService] Vai trò từ token:', userInfo.roles);
      return userInfo.roles || null;
    }
    console.warn('[TokenService] Không lấy được thông tin người dùng hoặc vai trò');
    return null;
  }

  getUserInfoObservable(): Observable<any> {
    return this.userInfoSubject.asObservable();
  }
}