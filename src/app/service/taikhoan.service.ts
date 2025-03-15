import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/rest/tai-khoan'; // API URL từ backend

  constructor(private http: HttpClient) {}

  getAccounts(page: number, size: number): Observable<any> {
    let params = `/page?page=${page}&size=${size}`;
    // if (searchTerm) {
    //   params += `&search=${searchTerm}`;
    // }
    return this.http.get(`${this.apiUrl}${params}`);
  }
}
