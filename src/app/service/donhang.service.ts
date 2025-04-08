import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  private apiUrl = 'http://localhost:8080/rest/don-hang';
  private apiHuy = 'http://localhost:8080/rest/don-hang';
  private diaChiApiUrl = 'http://localhost:8080/rest/dia-chi';
  private orderIdSource = new BehaviorSubject<string | null>(null);

  currentOrderId = this.orderIdSource.asObservable();

  constructor(private http: HttpClient) {}

  getDonhang(trangThai: number = -1): Observable<any> {
    let params = `/page?trangThai=${trangThai}`;
    return this.http.get(`${this.apiUrl}${params}`);
  }

  getDonhangWithoutPagination(): Observable<any> {
    const url = `http://localhost:8080/rest/don-hang/getAll`;
    return this.http.get(url);
  }

  setOrderId(orderId: string) {
    this.orderIdSource.next(orderId);
  }

  getDonhangById(donHangId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${donHangId}`).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Something went wrong!'));
      })
    );
  }

  getLichSuThaoTac(maDonHang: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lich-su-thao-tac/${maDonHang}`).pipe(
      catchError((error: any) => {
        return throwError(() => new Error('Error fetching history: ' + error.message));
      })
    );
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/rest/don-hang/${orderId}`);
  }

  capNhatTrangThaiTuDong(orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/capnhat-tu-dong/${orderId}`, {});
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.put<any>(`${this.apiHuy}/huy/${orderId}`, {});
  }

  // Lấy danh sách tỉnh/thành từ backend
  getProvinces(): Observable<any> {
    return this.http.get(`${this.diaChiApiUrl}/get-tinh-thanh`);
  }

  // Lấy danh sách quận/huyện từ backend
  getDistricts(provinceId: number): Observable<any> {
    return this.http.get(`${this.diaChiApiUrl}/get-quan-huyen/${provinceId}`);
  }

  // Lấy danh sách phường/xã từ backend
  getWards(districtId: number): Observable<any> {
    return this.http.get(`${this.diaChiApiUrl}/get-phuong-xa/${districtId}`);
  }

  updateOrderAddress(orderId: number, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-address/${orderId}`, updateData);
  }

  getLatestOrder(idTaiKhoan: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/latest/${idTaiKhoan}`);
  }
}