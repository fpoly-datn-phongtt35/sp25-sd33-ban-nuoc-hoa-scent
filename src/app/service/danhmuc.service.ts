import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',  // Đảm bảo rằng service được cung cấp ở cấp độ root
})

export class DanhMucService {
    constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:8080/rest/danh-muc'; // URL API của bạn

  getAllDanhMucDanhMuc(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`).pipe(
      catchError((error) => {
        console.error('Lỗi khi gọi API danh mục:', error);
        return throwError(() => error);
      })
    );
  }

}
