import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HuongGiuaService {
  private apiUrl='http://localhost:8080/rest/huong-giua';
  constructor(private http: HttpClient) { }

  getHuongGiua(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }
  add(data: { moTaHuongGiua: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, data);
  }


}
