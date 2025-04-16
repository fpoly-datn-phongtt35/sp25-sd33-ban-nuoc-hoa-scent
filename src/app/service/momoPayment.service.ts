import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MomoPaymentService {
  private baseUrl = 'http://localhost:8080/rest/momo';

  constructor(private http: HttpClient) {}

  createPayment(payload: any): Observable<any> {
    const filteredPayload = {
      amount: payload.amount,
      orderId: payload.orderId,
      orderInfo: payload.orderInfo,
      notifyUrl: payload.notifyUrl,
      returnUrl: payload.returnUrl,
      requestType: payload.requestType,
    };
    console.log('thông tin ck:', filteredPayload);
    return this.http.post(`${this.baseUrl}/pay`, filteredPayload);
  }
  checkStatus(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/check-status`, { orderId });
  }

}
