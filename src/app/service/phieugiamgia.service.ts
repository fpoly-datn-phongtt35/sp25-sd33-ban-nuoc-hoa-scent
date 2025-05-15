import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
interface DiscountResponse {
  message: any;
  giaTriGiam: number; // Percentage discount (e.g., 0.1 for 10%)
  giaTriToiDa?: number; // Maximum discount amount (optional)
  ngayBatDau: string;
  ngayHetHan: string;
  soLuong: number; // Remaining usage count
}
interface SpringErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

interface ErrorResponse {
  status: number;
  message: string;
}
@Injectable({
  providedIn: 'root',
})

export class PhieugiamgiaService {
  private apiUrl = 'http://localhost:8080/rest/phieu-giam-gia';

  constructor(private http: HttpClient) {}

  // phieugiamgia.service.ts
  // getDiscountCodeDetails(code: string, sdt: string, id: number | null): Observable<any> {
  //   const params: any = { code };
  //   if (id) params.idTaiKhoan = id;
  //   if (sdt) params.sdt = sdt;
  //   return this.http.get(`${this.apiUrl}/check`,{ params });
  // }
getDiscountCodeDetails(code: string, sdt: string, id: number | null): Observable<DiscountResponse> {
    const params: { [key: string]: string | number | null } = { code };
    if (id) params['idTaiKhoan'] = id;
    if (sdt) params['sdt'] = sdt;

    return this.http.get<DiscountResponse>(`${this.apiUrl}/check`, { params }).pipe(
      map(response => {
        // Kiểm tra nếu response có message lỗi
        if (response.message && response.message.startsWith('⚠️')) {
          throw new Error(response.message);
        }
        return { ...response, success: true };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '⚠️ Mã giảm giá không hợp lệ!';
        if (error.error) {
          if (typeof error.error === 'object') {
            const errorResponse = error.error as ErrorResponse;
            errorMessage = errorResponse.message || errorMessage;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error.includes('⚠️') ? error.error : `⚠️ ${error.error}`;
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu.';
  if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
  } else {
      // Server-side error
      if (error.status === 400 && error.error && error.error.message) {
          errorMessage = error.error.message;
      } else {
          errorMessage = `Mã lỗi: ${error.status} - ${error.statusText}\nThông báo: ${error.message}`;
      }
  }
  return throwError(() => new Error(errorMessage));
}

  getAllPhieuGiamGia(page: number, size: number): Observable<any> {
    let params = `/page?page=${page}&size=${size}`;
    return this.http.get(`${this.apiUrl}${params}`).pipe(
      catchError(this.handleError)
    );
  }

  addVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, voucher).pipe(
      catchError(this.handleError)
    );
  }

  deleteVoucher(voucherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/del/${voucherId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateVoucher(voucher: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, voucher).pipe(
      catchError(this.handleError)
    );
  }
  updateStatus(id: number, trangThai: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-status/${id}?trangThai=${trangThai}`, {});
  }

}
