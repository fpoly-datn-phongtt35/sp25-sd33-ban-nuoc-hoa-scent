import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ThuongHieu {
  id?: number;
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
  hasProduct?: boolean;
  soLuongSanPham?: number;
  canRestore?: boolean;
  isNew?: boolean;
}

export interface ThuongHieu1 {
  id: number;
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  last: boolean;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThuongHieuService {
  private apiUrl = 'http://localhost:8080/rest/thuong-hieu';

  constructor(private http: HttpClient) { }

  getThuonghieu(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`).pipe(
      catchError((error) => {
        console.error('Lỗi khi gọi API danh mục:', error);
        return throwError(() => error);
      })
    );
  }

  addThuongHieu(thuonghieu: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, thuonghieu);
  }

  getThuongHieu1(page: number, size: number = 12, searchQuery: string = '', exactMatch: boolean = false): Observable<PageResponse<ThuongHieu>> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('exactMatch', exactMatch.toString());

    if (searchQuery) {
      httpParams = httpParams.set('searchQuery', searchQuery);
    }

    const fullUrl = `${this.apiUrl}`;
    console.log('📌 Gửi yêu cầu API:', fullUrl, 'Params:', httpParams.toString());

    return this.http.get<PageResponse<ThuongHieu>>(fullUrl, { params: httpParams }).pipe(
      map(response => {
        console.log('📌 Phản hồi API:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      if (error.status === 400 && error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Mã lỗi: ${error.status} - ${error.statusText}\nThông báo: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  addThuongHieu1(thuongHieu: Omit<ThuongHieu, 'id'>): Observable<ThuongHieu> {
    return this.http.post<ThuongHieu>(this.apiUrl, thuongHieu).pipe(
      catchError((error) => {
        console.error('Lỗi khi thêm thương hiệu:', new Date().toISOString(), error);
        return throwError(() => error);
      })
    );
  }

  updateThuongHieu(id: number, thuongHieu1: ThuongHieu1): Observable<ThuongHieu1> {
    return this.http.put<ThuongHieu1>(`${this.apiUrl}/${id}`, thuongHieu1).pipe(
      catchError((error) => {
        console.error(`Error updating brand with ID ${id}:`, error);
        return throwError(() => new Error(`Không thể cập nhật thương hiệu với ID ${id}`));
      })
    );
  }

  deleteThuongHieu(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Lỗi khi xóa thương hiệu với ID ${id}:`, error);
        return throwError(() => new Error(`Failed to delete brand with ID ${id}`));
      })
    );
  }

  deactivateSanPhamByThuongHieuId(thuongHieuId: number): Observable<string> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/deactivate/thuong-hieu/${thuongHieuId}`, null).pipe(
      map((response) => response.message),
      catchError((error) => {
        console.error('Error deactivating san pham:', error);
        const errorMessage = error.error?.error || 'Không thể ngừng bán sản phẩm.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  restoreSanPhamByThuongHieuId(thuongHieuId: number): Observable<string> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/restore/thuong-hieu/${thuongHieuId}`, null).pipe(
      map((response) => response.message),
      catchError((error) => {
        console.error('Error restoring san pham:', error);
        const errorMessage = error.error?.error || 'Không thể khôi phục sản phẩm.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}