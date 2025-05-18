import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface DiscountResponse {
  message?: any;
  giaTriGiam: number;
  giaTriToiDa?: number;
  ngayBatDau: string;
  ngayHetHan: string;
  soLuong: number;
  giaTriDonToiThieu?: number;
}

interface SearchResponse {
  status: string;
  message: string;
  data: any[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
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

  // Phương thức tìm kiếm với phân trang
  searchVouchers(params: any): Observable<SearchResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page || '0')
      .set('size', params.size || '5')
      .set('sortField', params.sortField || 'id')
      .set('sortDirection', params.sortDirection || 'desc');

    if (params.maGiamGia) {
      httpParams = httpParams.set('maGiamGia', params.maGiamGia);
    }
    if (params.ngayBatDau) {
      httpParams = httpParams.set('ngayBatDau', params.ngayBatDau);
    }
    if (params.ngayHetHan) {
      httpParams = httpParams.set('ngayHetHan', params.ngayHetHan);
    }
    // Chỉ gửi trangThai nếu nó là giá trị hợp lệ ('0' hoặc '1')
    if (params.trangThai && params.trangThai !== null && params.trangThai !== undefined) {
      httpParams = httpParams.set('trangThai', params.trangThai);
    }
    if (params.dieuKienapDung && params.dieuKienapDung !== null && params.dieuKienapDung !== undefined) {
      httpParams = httpParams.set('dieuKienapDung', params.dieuKienapDung);
    }

    console.log('📌 URL gửi đi:', `${this.apiUrl}/search?` + httpParams.toString());
    return this.http.get<SearchResponse>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError)
    );
  }

  // Gửi mã giảm giá qua email
  sendCoupon(couponId: number, userId: number): Observable<any> {
    const params = { couponId, userId };
    return this.http.post<any>(`${this.apiUrl}/send-coupon`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getDiscountCodeDetails(code: string, sdt: string, id: number | null, tongGiaTriDonHang: number): Observable<DiscountResponse> {
    const params: { [key: string]: string | number | null } = { code, tongGiaTriDonHang };
    if (id) params['idTaiKhoan'] = id;
    if (sdt) params['sdt'] = sdt;

    return this.http.get<DiscountResponse>(`${this.apiUrl}/check`, { params }).pipe(
      map(response => {
        if (response.message && response.message.startsWith('⚠️')) {
          throw new Error(response.message);
        }
        return { ...response, success: true };
      }),
      catchError(this.handleError)
    );
  }

  getAllPhieuGiamGia(page: number, size: number): Observable<any> {
    const params = { page: page.toString(), size: size.toString() };
    return this.http.get(`${this.apiUrl}/page`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  addVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, voucher).pipe(
      catchError(this.handleError1)
    );
  }

  updateVoucher(id: number, voucher: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, voucher).pipe(
      catchError(this.handleError1)
    );
  }

  deleteVoucher(voucherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/del/${voucherId}`).pipe(
      catchError(this.handleError)
    );
  }

  

  updateStatus(id: number, trangThai: number): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/update-status/${id}?trangThai=${trangThai}`, {})
      .pipe(
        catchError((error) => {
          const errorMessage = error.error?.message || 'Lỗi không xác định. Kiểm tra console!';
          console.error('❌ Lỗi khi gọi API updateStatus:', error);
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  private handleError1(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu.';

    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client (ví dụ: lỗi mạng)
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Lỗi từ server
      if (error.status === 400) {
        if (typeof error.error === 'string') {
          // Backend trả về lỗi dạng văn bản thuần
          errorMessage = error.error.trim(); // Loại bỏ khoảng trắng thừa
        } else {
          // Nếu backend trả về JSON (trong trường hợp cấu trúc thay đổi)
          errorMessage = error.error?.message || `Lỗi từ server: ${error.status}`;
        }
      } else if (error.status === 404) {
        errorMessage = 'Không tìm thấy tài nguyên.';
      } else if (error.status === 0) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = `Mã lỗi: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('❌ Lỗi chi tiết:', error);
    return throwError(() => new Error(errorMessage));
  }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      if (error.status === 400 && error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = `Mã lỗi: ${error.status} - ${error.statusText}\nThông báo: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}