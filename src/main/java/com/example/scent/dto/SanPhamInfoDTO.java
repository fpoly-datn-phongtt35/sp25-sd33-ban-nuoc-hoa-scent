package com.example.scent.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;


public class SanPhamInfoDTO {
    private Integer IdSanPham;


    private String TenSanPham;


    private BigDecimal DonGia;
    private String imageURL;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;
    private Integer IdnhomHuong;

    public Integer getIdnhomHuong() {
        return IdnhomHuong;
    }

    public void setIdnhomHuong(Integer idnhomHuong) {
        IdnhomHuong = idnhomHuong;
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

    public BigDecimal getDonGia() {
        return DonGia;
    }

    public void setDonGia(BigDecimal donGia) {
        DonGia = donGia;
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

    public SanPhamInfoDTO(Integer idSanPham, String tenSanPham, BigDecimal donGia, String imageURL, String tenThuongHieu, String tenDanhMuc, String moTaHuongDau, String moTaHuongGiua, String moTaHuongCuoi, Integer idnhomHuong) {
        IdSanPham = idSanPham;
        TenSanPham = tenSanPham;
        DonGia = donGia;
        this.imageURL = imageURL;
        this.tenThuongHieu = tenThuongHieu;
        this.tenDanhMuc = tenDanhMuc;
        this.moTaHuongDau = moTaHuongDau;
        this.moTaHuongGiua = moTaHuongGiua;
        this.moTaHuongCuoi = moTaHuongCuoi;
        IdnhomHuong = idnhomHuong;
    }

    public SanPhamInfoDTO() {
    }
}

