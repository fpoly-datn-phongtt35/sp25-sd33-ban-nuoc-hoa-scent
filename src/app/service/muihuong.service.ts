import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MuiHuongService {
  private apiUrl = 'http://localhost:8080/rest/mui-huong';

  constructor(private http: HttpClient) {}

  getPagedMuiHuong(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addMuiHuong(muiHuong: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, muiHuong);
  }

  updateMuiHuong(id: number, muiHuong: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, muiHuong);
  }

  deleteMuiHuong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getAllMuiHuong(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=0&size=1000`);
  }
}
