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
     

      if (total > 4.5 * 1024 * 1024) {
       
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key) && key !== this.TOKEN_KEY && key !== this.USER_KEY) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      
      localStorage.clear();
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null;
    } catch (error) {
      
      return false;
    }
  }

  getToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      
      return token ? token : null;
    }
  
    return null;
  }

  setToken(token: string): void {
    if (!this.isLocalStorageAvailable()) {
     
      return;
    }

    this.clearLocalStorageIfFull();
    try {
     
      localStorage.setItem(this.TOKEN_KEY, token);
      const userInfo = this.getUserInfo();
      this.userInfoSubject.next(userInfo);
    } catch (error) {
      
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
     
    } else {
      
    }
  }

  setUser(user: any): void {
    if (!this.isLocalStorageAvailable()) {
     
      return;
    }

    this.clearLocalStorageIfFull();
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
     
      this.userInfoSubject.next(user);
    } catch (error) {
     
      localStorage.removeItem(this.USER_KEY);
      this.userInfoSubject.next(null);
    }
  }

  getUserId(): number {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      
      return userInfo.UserID || 0;
    }
   
    return 0;
  }

  getTenDangNhap(): string {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.tenDangNhap || '' : '';
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      
      return true;
    }
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      
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
        
        return decoded;
      } catch (error) {
       
        return null;
      }
    } else {
     
      return null;
    }
  }

  getRole(): string | null {
    const userInfo = this.getUserInfo();
    if (userInfo) {
     
      return userInfo.roles || null;
    }
    
    return null;
  }

  getUserInfoObservable(): Observable<any> {
    return this.userInfoSubject.asObservable();
  }
}