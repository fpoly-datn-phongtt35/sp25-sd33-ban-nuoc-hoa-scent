export interface YeuCauTraHang {
  id?: number;
  idTaiKhoan: number;
  donHang: { id: number };
  spct: { idSpct: number };
  soLuong: number;
  trangThai: number;
  lyDoTraHang: string;
  tinhTrangHang: string;
  hinhThucTraHang: string;
  ghiChu?: string;
  hinhAnhUrls?: string[];
  urlVideo?: string;
}