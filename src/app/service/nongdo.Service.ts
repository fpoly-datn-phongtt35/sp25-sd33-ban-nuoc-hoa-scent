import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class NongDoService {
  private apiUrl='http://localhost:8080/rest/nong-do';
  constructor(private http: HttpClient) { }

  getNongDo(): Observable<any> {
    return this.http.get(`${this.apiUrl}`).pipe(
      catchError((error) => {
        console.error('Lỗi khi gọi API danh mục:', error);
        return throwError(() => error);
      })
    );
    }
    addNongDo(thuonghieu: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}`, thuonghieu);
    }
}
