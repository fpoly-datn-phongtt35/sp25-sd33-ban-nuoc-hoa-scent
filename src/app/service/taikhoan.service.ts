import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/rest/tai-khoan'; // API URL từ backend

  constructor(private http: HttpClient) {}
  getAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    // Cấu hình các tham số cần thiết cho URL
    let params = `?searchTerm=${searchTerm}&page=${page}&size=${size}`;
    // Gửi yêu cầu GET với các tham số đã chuẩn bị
    return this.http.get(`${this.apiUrl}/page${params}`);
  }
  getStaffAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    // Cấu hình các tham số cần thiết cho URL
    let params = `?keyword=${searchTerm}&page=${page}&size=${size}`;
    // Gửi yêu cầu GET với các tham số đã chuẩn bị
    return this.http.get(`${this.apiUrl}/get-staff-accounts${params}`);
  }
  getUserAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    // Cấu hình các tham số cần thiết cho URL
    let params = `?keyword=${searchTerm}&page=${page}&size=${size}`;
    // Gửi yêu cầu GET với các tham số đã chuẩn bị
    return this.http.get(`${this.apiUrl}/get-user-accounts${params}`);
  }
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }
}
