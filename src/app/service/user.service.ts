import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from './response/user.response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'user';
  private apiUrl = 'http://localhost:8080/rest/don-hang/user';
  private baseUrl = 'http://localhost:8080/rest/tai-khoan';

  constructor(private http: HttpClient) { }
  getOrders(userId: number): Observable<any> {
    // Đảm bảo sử dụng userId trong URL API
    return this.http.get(`${this.apiUrl}/${userId}`);
  }
  getUserResponseFromLocalStorage(): UserResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  setUserResponseToLocalStorage(user: UserResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }
}
