import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  private apiUrl='http://localhost:8080/rest/don-hang';
  constructor(private http: HttpClient) { }

  getDonhang(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }
}
