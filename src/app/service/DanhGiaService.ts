import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DanhGiaService {
  private apiUrl = 'http://localhost:8080/api/danhgia';

  constructor(private http: HttpClient) {}

  // Lấy danh sách đánh giá của một sản phẩm
  getDanhGiaBySanPham(idSanPham: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sanpham/${idSanPham}`);
  }

  // Thêm đánh giá mới
  addDanhGia(danhGia: any): Observable<any> {
    return this.http.post(this.apiUrl, danhGia);
  }
}