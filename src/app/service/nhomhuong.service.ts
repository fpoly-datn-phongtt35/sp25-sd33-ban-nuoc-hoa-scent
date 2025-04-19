
import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NhomHuongService {
  private apiUrl = 'http://localhost:8080/rest/nhom-huong';

  constructor(private http: HttpClient) {}

  // Get all NhomHuong (non-paginated)
  getNhomHuong(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get paginated NhomHuong
  
  getPagedNhomHuong(page: number, size: number = 12): Observable<any> {
    let params = `?page=${page}&size=${size}`;
    return this.http.get(`${this.apiUrl}/paged${params}`).pipe(
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
  
  // Get NhomHuong by ID
  getNhomHuongById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Create new NhomHuong
  createNhomHuong(nhomHuong: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, nhomHuong);
  }

  // Update existing NhomHuong
  updateNhomHuong(id: number, nhomHuong: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, nhomHuong);
  }

  // Delete NhomHuong
  deleteNhomHuong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
