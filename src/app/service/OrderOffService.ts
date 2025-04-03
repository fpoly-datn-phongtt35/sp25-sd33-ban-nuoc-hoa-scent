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

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private cartService: CartService
  ) {}

  createOrder(order: any): Observable<any> {
    console.log('order', order);
    const userInfo = this.tokenService.getUserInfo();
    const orderRequest = {
      userId: Number(userInfo.UserID),
      tenNguoiNhanHang: order.tenNguoiNhanHang,
      sdtNguoiNhan: order.sdtNguoiNhan,
      chiTietDonHangs: order.chiTietDonHangs.map((item: any) => ({
        spctId: item.spctId,
        quantity: item.quantity
      })),
      maGiamGia: null,
      phuongThucThanhToan: order.phuongThucThanhToan,
      ghiChu: null
    };
    console.log('createOrder:', orderRequest);
    return this.http.post<any>(`${this.apiUrl}`, orderRequest);
  }

  searchSanPham(keyword: string): Observable<any> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/getAll-sptq`, { params });
  }

  // Thêm phương thức cập nhật trạng thái đơn hàng
  updateOrderStatus(orderId: number, updateRequest: any): Observable<any> {
    console.log('Update order status request:', { orderId, updateRequest });
    return this.http.put(`${this.apiUrl}/status/${orderId}`, updateRequest);
  }
}