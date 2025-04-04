import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = 'http://localhost:8080/rest/tai-khoan';

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách tài khoản với phân trang và tìm kiếm.
   * @param searchTerm Từ khóa tìm kiếm
   * @param page Số trang (bắt đầu từ 0)
   * @param size Số bản ghi mỗi trang
   * @returns Observable chứa danh sách tài khoản
   */
  getAccounts(searchTerm: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/page`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách tài khoản nhân viên với phân trang và tìm kiếm.
   * @param keyword Từ khóa tìm kiếm
   * @param page Số trang (bắt đầu từ 0)
   * @param size Số bản ghi mỗi trang
   * @returns Observable chứa danh sách tài khoản nhân viên
   */
  getStaffAccounts(keyword: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/get-staff-accounts`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách tài khoản người dùng với phân trang và tìm kiếm.
   * @param keyword Từ khóa tìm kiếm
   * @param page Số trang (bắt đầu từ 0)
   * @param size Số bản ghi mỗi trang
   * @returns Observable chứa danh sách tài khoản người dùng
   */
  getUserAccounts(keyword: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/get-user-accounts`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Đăng ký tài khoản mới.
   * @param user Thông tin tài khoản cần đăng ký
   * @returns Observable chứa thông tin tài khoản đã tạo
   */
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật thông tin tài khoản.
   * @param dto Dữ liệu cập nhật tài khoản
   * @returns Observable chứa thông tin tài khoản đã cập nhật
   */
  updateAccount(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cấp lại mật khẩu cho ADMIN/STAFF qua email.
   * @param email Email của tài khoản cần cấp lại mật khẩu
   * @returns Observable chứa thông báo kết quả
   */
  resetPassword(email: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.apiUrl}/forgot-password/reset-admin-staff`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm tài khoản theo email.
   * @param email Email cần tìm
   * @returns Observable chứa thông tin tài khoản (nếu tồn tại)
   */
  findByEmail(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.apiUrl}/findByEmail`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gửi OTP cho USER để khôi phục mật khẩu.
   * @param email Email của USER
   * @returns Observable chứa thông báo kết quả
   */
  sendOtpForUser(email: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.apiUrl}/forgot-password/sendOTP`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Đặt lại mật khẩu cho USER bằng OTP.
   * @param email Email của USER
   * @param otp Mã OTP
   * @param newPassword Mật khẩu mới
   * @returns Observable chứa thông báo kết quả
   */
  resetPasswordWithOtp(email: string, otp: string, newPassword: string): Observable<string> {
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp)
      .set('newPassword', newPassword);
    return this.http.post(`${this.apiUrl}/forgot-password/reset`, null, {
      params,
      responseType: 'text',
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Đổi mật khẩu cho USER (yêu cầu mật khẩu cũ).
   * @param username Tên đăng nhập
   * @param oldPassword Mật khẩu cũ
   * @param newPassword Mật khẩu mới
   * @returns Observable chứa thông báo kết quả
   */
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

  /**
   * Xử lý lỗi từ các yêu cầu HTTP.
   * @param error Lỗi từ server
   * @returns Observable phát ra lỗi
   */
  private handleError(error: any): Observable<never> {
    console.error('Có lỗi xảy ra:', error);
    const errorMessage = error.error || 'Đã xảy ra lỗi, vui lòng thử lại sau.';
    return throwError(() => new Error(errorMessage));
  }
}
