import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NhomHuongService {
  private apiUrl = 'http://localhost:8080/rest/nhom-huong'; // Thay URL đúng với backend

  constructor(private http: HttpClient) {}
  getnhomHuong(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  // Gửi đơn hàng lên backend
  createnhomHuong(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }
}
