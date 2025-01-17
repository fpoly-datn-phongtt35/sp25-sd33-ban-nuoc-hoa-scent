import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Đảm bảo service này được sử dụng toàn cục
})
export class DetailService {
    private apiBaseUrl = 'http://localhost:8080/rest'; // Thay bằng URL API của bạn
    private apiUrl = 'http://localhost:8080/rest/san-pham/sorted-by-price';

    constructor(private http: HttpClient) {}
  
    // Lấy thông tin chi tiết sản phẩm theo ID
    getProductDetailById(productId: number): Observable<any> {
      return this.http.get(`${this.apiBaseUrl}/san-pham/${productId}`);
    }
    getRecommendedProducts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
      }
}
