import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { YeuCauTraHang } from './response/YeuCauTraHang';

@Injectable({
  providedIn: 'root'
})
export class TraHangService {
  private apiUrl = 'http://localhost:8080/api/tra-hang';
  private apiDH = 'http://localhost:8080/rest/ctdh';
  private apiUser = 'http://localhost:8080/rest/don-hang';

  constructor(private http: HttpClient) {}

  getCompletedDonHangs(idTaiKhoan: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUser}/user/${idTaiKhoan}/completed-orders`).pipe(
      catchError(this.handleError)
    );
  }

  getSpctByDonHang(maDonHang: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiDH}/don-hang/${maDonHang}/spct`).pipe(
      catchError(this.handleError)
    );
  }

  createYeuCauTraHang(formData: FormData): Observable<YeuCauTraHang> {
    return this.http.post<YeuCauTraHang>(`${this.apiUrl}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getYeuCauByTinhTrangHang(tinhTrangHang: string): Observable<YeuCauTraHang[]> {
    return this.http.get<YeuCauTraHang[]>(`${this.apiUrl}/tinh-trang/${tinhTrangHang}`).pipe(
      catchError(this.handleError)
    );
  }

  approveYeuCauTraHang(id: number, idTaiKhoanDuyet: number): Observable<YeuCauTraHang> {
    return this.http.put<YeuCauTraHang>(`${this.apiUrl}/${id}/approve`, null, {
      params: { idTaiKhoanDuyet: idTaiKhoanDuyet.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  rejectYeuCauTraHang(id: number, idTaiKhoanDuyet: number, lyDoTuChoi: string): Observable<YeuCauTraHang> {
    return this.http.put<YeuCauTraHang>(`${this.apiUrl}/${id}/reject`, null, {
      params: { idTaiKhoanDuyet: idTaiKhoanDuyet.toString(), lyDoTuChoi }
    }).pipe(
      catchError(this.handleError)
    );
  }

  completeYeuCauTraHang(id: number, idTaiKhoanDuyet: number): Observable<YeuCauTraHang> {
    return this.http.put<YeuCauTraHang>(`${this.apiUrl}/${id}/complete`, null, {
      params: { idTaiKhoanDuyet: idTaiKhoanDuyet.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getYeuCauByTaiKhoan(idTaiKhoan: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${idTaiKhoan}`).pipe(
      catchError(this.handleError)
    );
  }

  getLichSuByYeuCauTraHang(idYeuCau: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idYeuCau}/history`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
    if (error.error && error.error.message) {
      // Lấy thông báo từ ErrorResponse của backend
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      // Lỗi mạng
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
    } else {
      // Lỗi HTTP khác (401, 403, 500, v.v.)
      errorMessage = `Lỗi ${error.status}: ${error.statusText || 'Không xác định'}. Vui lòng thử lại.`;
    }
    console.error('API Error:', error); // Ghi log để debug
    return throwError(() => new Error(errorMessage));
  }
}