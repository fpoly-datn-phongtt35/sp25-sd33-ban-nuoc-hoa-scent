import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class loginService {
    private apiUrl = 'http://localhost:8080/rest/tai-khoan/login'; // Cập nhật URL API của bạn

    constructor(private http: HttpClient) {}
    login(username: string, password: string): Observable<string> { // Chú ý thay đổi kiểu trả về sang string
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { tenDangNhap: username, matKhau: password };
      return this.http.post<string>(this.apiUrl, body, {
        headers: headers,
        responseType: 'text' as 'json'  // Ghi chú: ép kiểu 'text' as 'json' để phù hợp với kiểu dữ liệu mong muốn
      });
    }
}
