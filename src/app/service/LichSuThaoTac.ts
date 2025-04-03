import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export class LichSuThaoTac {
    id:number;
    maDonHang: number;
    trangThaiCu: number;
    trangThaiMoi: number;
    taiKhoanId: number;
    tenTaiKhoan: string;
    ghiChu: string;
    thoiGianThaoTac: string;
    thaoTac: string;
  }

@Injectable({
  providedIn: 'root'
})
export class LichSuThaoTacService {
  private apiUrl = 'http://localhost:8080/rest/don-hang/lich-su-thao-tac-by-user';

  constructor(private http: HttpClient) {}
  getAllLichSuThaoTac(): Observable<LichSuThaoTac[]> {
    return this.http.get<LichSuThaoTac[]>(this.apiUrl);
  }
}