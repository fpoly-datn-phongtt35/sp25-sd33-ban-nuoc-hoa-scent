import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { CartService } from './cart.Service';

@Injectable({
  providedIn: 'root'
})
export class OrderOffService {
  private apiUrl = 'http://localhost:8080/rest/offline-orders';

  constructor(private http: HttpClient ,private tokenService:TokenService,private cartService :CartService) {}

  createOrder(order: any): Observable<any> {
    const orderRequest = {

      idTaiKhoan: order.UserID, // Replace with the actual staff account ID (e.g., from a logged-in user)
      tenNguoiNhanHang: order.donHang.tenNguoiNhanHangs,
      sdtNguoiNhan: order.donHang.sdtNguoiNhan,
      chiTietDonHangs: order.chiTietDonHangs.map((item: any) => ({
        spctId: item.spct.spctId,
        quantity: item.soLuong
      })),
      maGiamGia:null,
      phuongThucThanhToan: order.phuongThucThanhToan, // Default to "Tiền mặt" for offline orders
      ghiChu: null
    };

    return this.http.post<any>(`${this.apiUrl}`, orderRequest);
  }
  searchSanPham(keyword: string): Observable<any> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/getAll-sptq`, { params });
  }
}
