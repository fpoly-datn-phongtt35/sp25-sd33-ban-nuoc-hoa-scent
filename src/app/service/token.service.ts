import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import jwt_decode from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private jwtHelper = new JwtHelperService();
  private userInfoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
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
    const userInfo = this.getUserInfo(); // Đảm bảo phương thức này trả về payload chính xác của token
    if (userInfo) {
        console.log('User Info:', userInfo); // Đây là lệnh log để bạn có thể kiểm tra đầu ra
        return userInfo.UserID || 0; // Chú ý: Sử dụng 'UserID' như trong token
    }
    return 0;
}



// Get tenDangNhap
getTenDangNhap(): string {
  const userInfo = this.getUserInfo();
  return userInfo ? userInfo.tenDangNhap : '';
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
        console.log('Payload từ token:', payload);
        return payload;
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return null;
      }
    }
    else{
      console.log("Token tu localStorage: null");
      return null;
    }
    
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
      console.log('Vai trò từ token:', payload);
      return payload.roles || null;
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  }
  getUserInfoObservable(): Observable<any> {
    return this.userInfoSubject.asObservable();
  }

  
}
