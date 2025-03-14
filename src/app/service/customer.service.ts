import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl='http://localhost:8080/rest/khach-hang';
  constructor(private http: HttpClient) { }

  getCustomers(page: number, size: number): Observable<any> {
    let params = `/page?page=${page}&size=${size}`;
    // if (searchTerm) {
    //   params += `&search=${searchTerm}`;
    // }
    return this.http.get(`${this.apiUrl}${params}`);
  }

  addCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, customerData);
  }
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/del/${id}`);
  }
  updateCustomer(customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, customerData);
}
}
