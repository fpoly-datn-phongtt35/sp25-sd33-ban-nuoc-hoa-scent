import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaChiService {
  private baseUrl = 'http://localhost:8080/rest/dia-chi';

  constructor(private http: HttpClient) {}

  getTinhThanh(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/rest/dia-chi/get-tinh-thanh');
  }

  getQuanHuyen(idTinh: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/rest/dia-chi/get-quan-huyen/${idTinh}`);
  }

  getPhuongXa(idHuyen: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/rest/dia-chi/get-phuong-xa/${idHuyen}`);
  }


  tinhPhiVanChuyen(data: any): Observable<number> {
    return this.http.post<{ total: number }>(`${this.baseUrl}/tinh-phi-van-chuyen`, data)
      .pipe(map(res => res.total || 0));
  }
}
