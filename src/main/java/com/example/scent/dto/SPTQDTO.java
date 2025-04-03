package com.example.scent.dto;

import java.math.BigDecimal;

public class SPTQDTO {
    private Integer idSanPham;
    private String tenSanPham;
    private BigDecimal donGia;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;
    private Integer idNhomHuong;
    private String tenNhomHuong;
    private String quocGia;
    private String urlImage;
    public SPTQDTO() {
    }

    public String getUrlImage() {
        return urlImage;
    }

    public void setUrlImage(String urlImage) {
        this.urlImage = urlImage;
    }

    public SPTQDTO(Integer idSanPham, String tenSanPham, BigDecimal donGia, String tenThuongHieu, String tenDanhMuc, String moTaHuongDau, String moTaHuongGiua, String moTaHuongCuoi, Integer idNhomHuong, String tenNhomHuong, String quocGia, String urlImage) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.donGia = donGia;
        this.tenThuongHieu = tenThuongHieu;
        this.tenDanhMuc = tenDanhMuc;
        this.moTaHuongDau = moTaHuongDau;
        this.moTaHuongGiua = moTaHuongGiua;
        this.moTaHuongCuoi = moTaHuongCuoi;
        this.idNhomHuong = idNhomHuong;
        this.tenNhomHuong = tenNhomHuong;
        this.quocGia = quocGia;
        this.urlImage = urlImage;
    }

    public Integer getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        this.idSanPham = idSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
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

    public Integer getIdNhomHuong() {
        return idNhomHuong;
    }

    public void setIdNhomHuong(Integer idNhomHuong) {
        this.idNhomHuong = idNhomHuong;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public String getQuocGia() {
        return quocGia;
    }

    public void setQuocGia(String quocGia) {
        this.quocGia = quocGia;
    }
}
