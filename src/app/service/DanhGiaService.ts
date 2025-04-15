import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  checkIfReviewed(idSanPham: number, idTaiKhoan: number, idDonHang: number): Observable<boolean> {
    return this.getDanhGiaBySanPham(idSanPham).pipe(
      map((danhGias) => {
        console.log(`Danh sách đánh giá cho sản phẩm ${idSanPham}:`, danhGias);
        const hasReviewed = danhGias.some(
          (danhGia) =>
            Number(danhGia.idTaiKhoan) === idTaiKhoan && Number(danhGia.idDonHang) === idDonHang
        );
        console.log(`Kết quả kiểm tra đánh giá: ${hasReviewed}`);
        return hasReviewed;
      })
    );
  }
  updateDanhGia(id: number, danhGiaDTO: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, danhGiaDTO);
  }

  // Xóa đánh giá
  deleteDanhGia(id: number, idTaiKhoan: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?idTaiKhoan=${idTaiKhoan}`);
  }

  // Lấy đánh giá của người dùng cho sản phẩm trong đơn hàng
  getUserDanhGia(idSanPham: number, idTaiKhoan: number, idDonHang: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/user?productId=${idSanPham}&userId=${idTaiKhoan}&orderId=${idDonHang}`
    );
  }
}