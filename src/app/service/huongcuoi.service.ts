import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HuongCuoiService {
  private apiUrl = 'http://localhost:8080/rest/huong-cuoi';  // Địa chỉ API cho "hương cuối"
  constructor(private http: HttpClient) { }

  getHuongCuoi(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }
}
