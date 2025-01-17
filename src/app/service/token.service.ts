import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private jwtHelper = new JwtHelperService();

  constructor() {}

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    return this.jwtHelper.isTokenExpired(token);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.role || null;
    }
    return null;
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (token) {
      try {
        return this.jwtHelper.decodeToken(token);
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return null;
      }
    }
    return null;
  }
  
}
