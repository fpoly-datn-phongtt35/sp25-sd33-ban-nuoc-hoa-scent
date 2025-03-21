import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError,BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  private apiUrl = 'http://localhost:8080/rest/don-hang';
  private orderIdSource = new BehaviorSubject<string | null>(null);

  currentOrderId = this.orderIdSource.asObservable();
  constructor(private http: HttpClient) {}
  getDonhang(trangThai: number = -1): Observable<any> {
    // Chỉ truyền tham số trangThai vào URL
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
    return this.http.get(`${this.apiUrl}/${donHangId}`)
      .pipe(
        catchError((error: any) => {
          return throwError(() => new Error('Something went wrong!'));
        })
      );
  }
  
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/rest/don-hang/${orderId}`);
  }
}

