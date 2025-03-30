import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MomoPaymentService {
  private baseUrl = 'http://localhost:8080/rest/momo';

  constructor(private http: HttpClient) {}

  createPayment(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/pay`, payload);
  }

  checkStatus(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/check-status`, { orderId });
  }

}
