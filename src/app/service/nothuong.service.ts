import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotHuongService {
  private apiUrl = 'http://localhost:8080/rest/not-huong';

  constructor(private http: HttpClient) {}

  getPagedNotHuong(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addNotHuong(notHuong: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, notHuong);
  }

  updateNotHuong(id: number, notHuong: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, notHuong);
  }

  deleteNotHuong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
