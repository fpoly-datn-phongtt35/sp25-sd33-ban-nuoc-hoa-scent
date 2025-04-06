import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VietQRService {
  private apiUrl = 'https://api.vietqr.io/v2/generate';
  private clientId = '60222906-eb57-483e-8bc0-6db5728b7333'; // Client ID từ VietQR
  private apiKey = '21f3e91-58f1-4c15-bab0-a50017fd7349'; // API Key từ VietQR

  constructor(private http: HttpClient) {}

  generateQRCode(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'x-client-id': this.clientId,
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, data, { headers });
  }
}
