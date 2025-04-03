package com.example.scent.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuThaoTac")
public class LichSuThaoTac {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "maDonHang")
    private Integer maDonHang;

    @Column(name = "taiKhoanId")
    private Integer taiKhoanId;

    @Column(name = "tenTaiKhoan")
    private String tenTaiKhoan;

    @Column(name = "thaoTac")
    private String thaoTac;

    @Column(name = "trangThaiCu")
    private Integer trangThaiCu;

    @Column(name = "trangThaiMoi")
    private Integer trangThaiMoi;

    @Column(name = "thoiGianThaoTac")
    private LocalDateTime thoiGianThaoTac;

    @Column(name = "ghiChu")
    private String ghiChu;

    // Getters và Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMaDonHang() {
        return maDonHang;
    }

    public void setMaDonHang(Integer maDonHang) {
        this.maDonHang = maDonHang;
    }

    public Integer getTaiKhoanId() {
        return taiKhoanId;
    }

    public void setTaiKhoanId(Integer taiKhoanId) {
        this.taiKhoanId = taiKhoanId;
    }

    public String getTenTaiKhoan() {
        return tenTaiKhoan;
    }

    public void setTenTaiKhoan(String tenTaiKhoan) {
        this.tenTaiKhoan = tenTaiKhoan;
    }

    public String getThaoTac() {
        return thaoTac;
    }

    public void setThaoTac(String thaoTac) {
        this.thaoTac = thaoTac;
    }

    public Integer getTrangThaiCu() {
        return trangThaiCu;
    }

    public void setTrangThaiCu(Integer trangThaiCu) {
        this.trangThaiCu = trangThaiCu;
    }

    public Integer getTrangThaiMoi() {
        return trangThaiMoi;
    }

    public void setTrangThaiMoi(Integer trangThaiMoi) {
        this.trangThaiMoi = trangThaiMoi;
    }

    public LocalDateTime getThoiGianThaoTac() {
        return thoiGianThaoTac;
    }

    public void setThoiGianThaoTac(LocalDateTime thoiGianThaoTac) {
        this.thoiGianThaoTac = thoiGianThaoTac;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}