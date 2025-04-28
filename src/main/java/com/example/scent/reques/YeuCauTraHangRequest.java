package com.example.scent.reques;

import com.example.scent.entity.DonHang;
import com.example.scent.entity.Spct;
import com.example.scent.entity.TaiKhoan;
import lombok.Data;

@Data
public class YeuCauTraHangRequest {
    private DonHang donHang;
    private TaiKhoan taiKhoan;
    private Spct spct;
    private Integer soLuong;
    private Integer trangThai;
    private String lyDoTraHang;
    private String tinhTrangHang;
    private String hinhThucTraHang;
    private String ghiChu;
    private Integer idTaiKhoan; // Thêm idTaiKhoan vào JSON

}
