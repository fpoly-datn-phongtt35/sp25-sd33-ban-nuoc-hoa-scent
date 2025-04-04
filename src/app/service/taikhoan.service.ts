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

  // Lấy danh sách tài khoản
  getAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    let params = `?searchTerm=${searchTerm}&page=${page}&size=${size}`;
    return this.http.get(`${this.apiUrl}/page${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy danh sách tài khoản nhân viên
  getStaffAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    let params = `?keyword=${searchTerm}&page=${page}&size=${size}`;
    return this.http.get(`${this.apiUrl}/get-staff-accounts${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy danh sách tài khoản người dùng
  getUserAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    let params = `?keyword=${searchTerm}&page=${page}&size=${size}`;
    return this.http.get(`${this.apiUrl}/get-user-accounts${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // Đăng ký tài khoản
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  // Cập nhật tài khoản
  updateAccount(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Cấp lại mật khẩu
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password/reset-admin-staff`, null, {
      params: { email },
      responseType: 'text' // API trả về dạng text
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi
  private handleError(error: any): Observable<never> {
    console.error('Có lỗi xảy ra:', error);
    return throwError(() => new Error('Đã xảy ra lỗi, vui lòng thử lại sau.'));
  }
}
