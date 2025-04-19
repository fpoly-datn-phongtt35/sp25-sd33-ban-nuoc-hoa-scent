import { Injectable } from '@angular/core';

import { HttpClient,HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
export interface ThuongHieu {
  id?: number; // Optional for creating new brands
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
}
export interface ThuongHieu1 {
  id: number; // Optional for creating new brands
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
}

@Injectable({
  providedIn: 'root'
})
export class ThuongHieuService {
  private apiUrl='http://localhost:8080/rest/thuong-hieu';
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
    
    
    getThuongHieu1(page: number, size: number = 12): Observable<any> {
      let params = `?page=${page}&size=${size}`;
      return this.http.get(`${this.apiUrl}${params}`).pipe(
        catchError(this.handleError)
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
    
  
    
  
    addThuongHieu1(thuongHieu: Omit<ThuongHieu, 'id'>): Observable<ThuongHieu> {
      return this.http.post<ThuongHieu>(this.apiUrl, thuongHieu).pipe(
        catchError((error) => {
          console.error('Lỗi khi thêm thương hiệu:', error);
          return throwError(() => new Error('Failed to add brand'));
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
}
