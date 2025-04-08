import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/rest/don-hang'; // Thay URL đúng với backend

  constructor(private http: HttpClient) {}

  // Gửi đơn hàng lên backend
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }
  getLatestOrder(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/latest/${userId}`);
  }
}
