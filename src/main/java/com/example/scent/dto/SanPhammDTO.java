package com.example.scent.dto;

import java.math.BigDecimal;

public class SanPhammDTO {
    private Integer IdSanPham;
    private String TenSanPham;
    private String imageURL;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;
    private String tenNhomHuong;
    private Long tongSoLuong;

    public Long getTongSoLuong() {
        return tongSoLuong;
    }

    public void setTongSoLuong(Long tongSoLuong) {
        this.tongSoLuong = tongSoLuong;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public Integer getIdSanPham() {
        return IdSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        IdSanPham = idSanPham;
    }

    public String getTenSanPham() {
        return TenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        TenSanPham = tenSanPham;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public String getTenDanhMuc() {
        return tenDanhMuc;
    }

    public void setTenDanhMuc(String tenDanhMuc) {
        this.tenDanhMuc = tenDanhMuc;
    }

    public String getMoTaHuongDau() {
        return moTaHuongDau;
    }

    public void setMoTaHuongDau(String moTaHuongDau) {
        this.moTaHuongDau = moTaHuongDau;
    }

    public String getMoTaHuongGiua() {
        return moTaHuongGiua;
    }

    public void setMoTaHuongGiua(String moTaHuongGiua) {
        this.moTaHuongGiua = moTaHuongGiua;
    }

    public String getMoTaHuongCuoi() {
        return moTaHuongCuoi;
    }

    public void setMoTaHuongCuoi(String moTaHuongCuoi) {
        this.moTaHuongCuoi = moTaHuongCuoi;
    }

    public SanPhammDTO(Integer idSanPham, String tenSanPham, String imageURL, String tenThuongHieu, String tenDanhMuc, String moTaHuongDau, String moTaHuongGiua, String moTaHuongCuoi, String tenNhomHuong, Long tongSoLuong) {
        IdSanPham = idSanPham;
        TenSanPham = tenSanPham;
        this.imageURL = imageURL;
        this.tenThuongHieu = tenThuongHieu;
        this.tenDanhMuc = tenDanhMuc;
        this.moTaHuongDau = moTaHuongDau;
        this.moTaHuongGiua = moTaHuongGiua;
        this.moTaHuongCuoi = moTaHuongCuoi;
        this.tenNhomHuong = tenNhomHuong;
        this.tongSoLuong = tongSoLuong;
    }

    public SanPhammDTO() {
    }
}
