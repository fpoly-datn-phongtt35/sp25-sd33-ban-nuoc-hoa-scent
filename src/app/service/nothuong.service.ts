import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotHuongWithStatusDTO {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
  tenMuiHuong?: string;
  hasProduct: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotHuongService {
  private apiUrl = 'http://localhost:8080/rest/not-huong';

  constructor(private http: HttpClient) {}

  getPagedNotHuong(page: number, size: number): Observable<{ content: NotHuongWithStatusDTO[] }> {
    return this.http.get<{ content: NotHuongWithStatusDTO[] }>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addNotHuong(notHuong: any): Observable<NotHuongWithStatusDTO> {
    return this.http.post<NotHuongWithStatusDTO>(this.apiUrl, notHuong);
  }

  updateNotHuong(id: number, notHuong: any): Observable<NotHuongWithStatusDTO> {
    return this.http.put<NotHuongWithStatusDTO>(`${this.apiUrl}/${id}`, notHuong);
  }

  deleteNotHuong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}