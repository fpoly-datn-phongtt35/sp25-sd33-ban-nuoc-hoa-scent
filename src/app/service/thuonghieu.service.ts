import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
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

    getThuongHieu1(page: number = 0, size: number = 10): Observable<PageResponse<ThuongHieu>> {
      const url = `${this.apiUrl}?page=${page}&size=${size}`;
      return this.http.get<PageResponse<ThuongHieu>>(url).pipe(
        catchError((error) => {
          console.error('Lỗi khi lấy danh sách thương hiệu:', error);
          return throwError(() => new Error('Failed to fetch brands'));
        })
      );
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
