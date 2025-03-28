import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class SpctService {
  private apiUrl='http://localhost:8080/rest/spct';
  private urlAdd='http://localhost:8080/rest/spct/add';
  constructor(private http: HttpClient) { }

  getSpcts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }
  geSpctByIdProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getByidSanPham/${id}`);
  }
  addSpcttOnAdmin(spct: any): Observable<any> {
    const url = `${this.urlAdd}`;
    return this.http.post<any>(url, spct);
  }
  updateSpctOnAdmin(spct:any):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/update`,spct);
  }
}
