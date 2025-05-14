import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  isActive: number; // Thay boolean thành number
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = 'http://localhost:8080/api/banners';

  constructor(private http: HttpClient) {}

  getAllBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }

  getActiveBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/active`);
  }

  getBannerById(id: number): Observable<Banner> {
    return this.http.get<Banner>(`${this.apiUrl}/${id}`);
  }

  createBanner(formData: FormData): Observable<Banner> {
    return this.http.post<Banner>(this.apiUrl, formData);
  }

  updateBanner(id: number, formData: FormData): Observable<Banner> {
    return this.http.put<Banner>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleBannerStatus(id: number): Observable<Banner> {
    return this.http.put<Banner>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}