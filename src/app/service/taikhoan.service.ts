import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = 'http://localhost:8080/rest/tai-khoan';
  private readonly otpApiUrl = 'http://localhost:8080/rest/otp';
  private readonly ApiDonHangUrl = 'http://localhost:8080/rest/don-hang';

  constructor(private http: HttpClient) {}

  getAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/page`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getStaffAccounts(keyword: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/get-staff-accounts`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getUserAccounts(keyword: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/get-user-accounts`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  updateAccount(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, dto).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.apiUrl}/forgot-password/reset-admin-staff`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

// Kiểm tra email
  findByEmail(email: string): Observable<{ email: any; success: boolean; message: string }> {
    const params = new HttpParams().set('email', email);
    return this.http
      .get<{ email: any; success: boolean; message: string }>(`${this.apiUrl}/findByEmail`, { params })
      .pipe(catchError(this.handleError));
  }

// Gửi OTP
  sendOtpForUser(email: string): Observable<{ success: boolean; message: string }> {
    const params = new HttpParams().set('email', email);
    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password/sendOTP`, null, { params })
      .pipe(catchError(this.handleError));
  }
 // Đặt lại mật khẩu với OTP
  resetPasswordWithOtp(email: string, otp: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp)
      .set('newPassword', newPassword);
    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password/reset`, null, { params })
      .pipe(catchError(this.handleError));
  }

  changePassword(username: string, oldPassword: string, newPassword: string): Observable<string> {
    const params = new HttpParams()
      .set('username', username)
      .set('oldPassword', oldPassword)
      .set('newPassword', newPassword);
    return this.http.put(`${this.apiUrl}/change-password`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

  findByUsername(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.get(`${this.apiUrl}/findByUsername`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  sendOtp(email: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.otpApiUrl}/send`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

  verifyOtp(email: string, otp: string): Observable<string> {
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp);
    return this.http.post(`${this.otpApiUrl}/verify`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

 // Xử lý lỗi chung
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!';
    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Lỗi phía server
      errorMessage = error.error?.message || `Lỗi server: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }
  verifyOldPassword(username: string, oldPassword: string): Observable<string> {
    const params = new HttpParams()
      .set('username', username)
      .set('oldPassword', oldPassword);
    return this.http.get(`${this.apiUrl}/verify-old-password`, { params, responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }
  cons
  // Lấy danh sách đơn hàng theo id tài khoản
  getOrdersByTaiKhoanId(idTaiKhoan: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ApiDonHangUrl}/getByIdTaiKhoan/${idTaiKhoan}`);
  }
  setTrangThaiByIdTaiKhoan(id: number, trangThai: number): Observable<any> {
    const params = new HttpParams().set('trangThai', trangThai.toString());
    return this.http.put<any>(`${this.apiUrl}/setTrangThaiByIdTaiKhoan/${id}`, null, { params });
  }
}
