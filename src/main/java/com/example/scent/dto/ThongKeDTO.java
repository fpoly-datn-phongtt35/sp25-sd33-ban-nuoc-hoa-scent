package com.example.scent.dto;

public class ThongKeDTO {
    private String tenKhachHang;
    private String tenSanPham;
    private Long soLuongMua;

    public ThongKeDTO() {
    }

    public ThongKeDTO(String tenKhachHang, String tenSanPham, Long soLuongMua) {
        this.tenKhachHang = tenKhachHang;
        this.tenSanPham = tenSanPham;
        this.soLuongMua = soLuongMua;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public Long getSoLuongMua() {
        return soLuongMua;
    }

    public void setSoLuongMua(Long soLuongMua) {
        this.soLuongMua = soLuongMua;
    }
}
