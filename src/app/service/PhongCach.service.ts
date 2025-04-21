import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhongCachService {
  private apiUrl = 'http://localhost:8080/rest/phong-cach';

  constructor(private http: HttpClient) {}

  getPagedPhongCach(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addPhongCach(phongCach: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, phongCach);
  }

  updatePhongCach(id: number, phongCach: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, phongCach);
  }

  deletePhongCach(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
