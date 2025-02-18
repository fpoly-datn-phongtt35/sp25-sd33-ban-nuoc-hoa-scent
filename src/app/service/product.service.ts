import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Đảm bảo service này có thể sử dụng ở mọi nơi
})
export class SanPhamService {
  private apiURL = 'http://localhost:8080/rest/san-pham/All'; // URL của API

  constructor(private http: HttpClient) {
    console.log('SanPhamService đã được khởi tạo.');
  }

  // Phương thức để lấy danh sách sản phẩm
  getSanPhamDetails(page: number = 0, size: number = 12): Observable<any> {
    console.log(`Requesting API: ${this.apiURL}?page=${page}&size=${size}`);
    return this.http.get<any>(`${this.apiURL}?page=${page}&size=${size}`);
  }
}
