import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',  // Đảm bảo rằng service được cung cấp ở cấp độ root
})

export class PhieugiamgiaService {
    constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:8080/rest/phieu-giam-gia'; // URL API của bạn

  getAllPhieuGiamGia(page: number, size: number): Observable<any> {
    let params = `/page?page=${page}&size=${size}`;
    // if (searchTerm) {
    //   params += `&search=${searchTerm}`;
    // }
    return this.http.get(`${this.apiUrl}${params}`);
  }

  addVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, voucher);
  }
  deleteVoucher(voucherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/del/${voucherId}`);
  }
  updateVoucher(voucher: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, voucher);
  }

}
