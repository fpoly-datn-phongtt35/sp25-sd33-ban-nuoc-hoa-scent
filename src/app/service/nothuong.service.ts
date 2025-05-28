import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// Định nghĩa interface cho NotHuongWithStatusDTO
export interface NotHuongWithStatusDTO {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
  hasProduct?: boolean;
  isNew?: boolean;
}

// Định nghĩa interface cho MuiHuong
export interface MuiHuong {
  id: number;
  tenMuiHuong: string;
  moTa: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotHuongService {
  private apiUrl = 'http://localhost:8080/rest/not-huong';
  private muiHuongApiUrl = 'http://localhost:8080/rest/mui-huong';
  private muiHuongsSubject = new BehaviorSubject<MuiHuong[]>([]);
  public muiHuongs$ = this.muiHuongsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadMuiHuongs(); // Tải danh sách mùi hương khi service khởi tạo
  }

  // Tải danh sách mùi hương và cập nhật BehaviorSubject
  loadMuiHuongs(): void {
    this.http.get<any>(`${this.muiHuongApiUrl}?page=0&size=1000`).subscribe({
      next: (res) => {
        if (res && res.content) {
          this.muiHuongsSubject.next(res.content);
        } else {
          console.error('Không tìm thấy danh sách mùi hương.');
          this.muiHuongsSubject.next([]);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách mùi hương:', err);
        this.muiHuongsSubject.next([]);
      }
    });
  }

  // API để lấy danh sách nốt hương
  getPagedNotHuong(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  // API để thêm nốt hương
  addNotHuong(notHuong: any): Observable<NotHuongWithStatusDTO> {
    return this.http.post<NotHuongWithStatusDTO>(this.apiUrl, notHuong);
  }

  // API để cập nhật nốt hương
  updateNotHuong(id: number, notHuong: any): Observable<NotHuongWithStatusDTO> {
    return this.http.put<NotHuongWithStatusDTO>(`${this.apiUrl}/${id}`, notHuong);
  }

  // API để xóa nốt hương
  deleteNotHuong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // API để lấy danh sách mùi hương (không cần nữa vì đã dùng BehaviorSubject)
  getAllMuiHuong(): Observable<any> {
    return this.http.get<any>(`${this.muiHuongApiUrl}?page=0&size=1000`);
  }
}