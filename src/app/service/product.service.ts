import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service này được sử dụng ở mọi nơi
})
export class SanPhamService {
  private apiURL = 'http://localhost:8080/rest/san-pham/details'; // URL của API

  constructor(private http: HttpClient) {}

  // Phương thức để lấy danh sách sản phẩm
  getSanPhamDetails(page: number = 0, size: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiURL}?page=${page}&size=${size}`);
  }
}
