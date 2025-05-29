export interface YeuCauTraHang {
  id?: number;
  idTaiKhoan: number;
  taiKhoan: TaiKhoan;
  donHang: { id: number };
  spct: SanPhamChiTietTraHang; // Sử dụng một interface mới để phản ánh cấu trúc trả về từ getSpctByDonHang
  soLuong: number;
  trangThai: number;
  lyDoTraHang: string;
  tinhTrangHang: string;
  hinhThucTraHang: string;
  ghiChu?: string;
  hinhAnhUrls?: string[];
  urlVideo?: string;
}

export interface TaiKhoan {
  id: number;
  tenDangNhap: string;
}

// Interface mới cho spct từ getSpctByDonHang
export interface SanPhamChiTietTraHang {
  idSpct: number;
  tenSanPham?: string; // Từ getSpctByDonHang
  maxQuantity?: number;
  dungTich?: string;
  hasReturnRequest?: boolean;
  trangThai?: number;
}