import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { YeuCauTraHang } from './response/YeuCauTraHang';
export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
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

    getSpctByDonHang(maDonHang: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiDH}/don-hang/${maDonHang}/spct`).pipe(
            map((spctDetails: any[]) => {
                if (!spctDetails || spctDetails.length === 0) {
                    return [];
                }
                return spctDetails.map(spct => ({
                    idSpct: spct.idSpct,
                    tenSanPham: spct.tenSanPham,
                    maxQuantity: spct.maxQuantity || 1,
                    dungTich : spct.dungTich,
                    hasReturnRequest :spct.hasReturnRequest,
                    trangThai :spct.trangThai
                }));
            }),
            catchError(this.handleError)
        );
    }

    createYeuCauTraHang(formData: FormData): Observable<YeuCauTraHang[]> {
        for (const [key, value] of Array.from(formData.entries())) {
            console.log(`FormData key: ${key}, value: ${value instanceof File ? value.name : value}`);
        }
        return this.http.post<YeuCauTraHang[]>(this.apiUrl, formData).pipe(
            catchError(this.handleError)
        );
    }
    getYeuCauByTinhTrangHang(tinhTrangHang: string, page: number = 0, size: number = 10): Observable<Page<YeuCauTraHang>> {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
      return this.http.get<any>(`${this.apiUrl}/tinh-trang/${tinhTrangHang}`, { params }).pipe(
        map(response => {
          console.log('API Response in getYeuCauByTinhTrangHang:', response);
          return {
            content: response.content || [],
            page: response.page || { size: 0, number: 0, totalElements: 0, totalPages: 0 }
          };
        }),
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
    getAllYeuCauTraHang(page: number = 0, size: number = 10): Observable<Page<YeuCauTraHang>> {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
      return this.http.get<any>(this.apiUrl, { params }).pipe(
        map(response => {
          console.log('API Response in getAllYeuCauTraHang:', response);
          return {
            content: response.content || [],
            page: response.page || { size: 0, number: 0, totalElements: 0, totalPages: 0 }
          };
        }),
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
            errorMessage = error.error.message;
        } else if (error.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else {
            errorMessage = `Lỗi ${error.status}: ${error.statusText || 'Không xác định'}. Vui lòng thử lại.`;
        }
        console.error('API Error:', error);
        return throwError(() => new Error(errorMessage));
    }
}