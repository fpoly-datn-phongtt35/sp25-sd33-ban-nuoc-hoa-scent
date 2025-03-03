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

  getAllPhieuGiamGia(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }
}
