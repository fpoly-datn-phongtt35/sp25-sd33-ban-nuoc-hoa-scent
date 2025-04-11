package com.example.scent.dto;

import java.math.BigDecimal;
import java.util.List;

public class SanPhamDetailDto {
    private Integer idSanPham;
    private String tenSanPham;
    private String moTaSanPham;
    private Integer idSpct;
    private BigDecimal donGia;
    private Integer soLuongTonKho;
    private Integer dungTich;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;
    private String imageURL;
    private String tenNhomHuong;
    private String phongCachs;
    private List<MuiHuongDto> muiHuongs;

    // Constructor
    public SanPhamDetailDto(SanPhamDto sanPhamDto, List<MuiHuongDto> muiHuongs) {
        if (sanPhamDto != null) {
            this.idSanPham = sanPhamDto.getIdSanPham();
            this.tenSanPham = sanPhamDto.getTenSanPham();
            this.moTaSanPham = sanPhamDto.getMoTaSanPham();
            this.idSpct = sanPhamDto.getIdSpct();
            this.donGia = sanPhamDto.getDonGia();
            this.soLuongTonKho = sanPhamDto.getSoLuongTonKho();
            this.dungTich = sanPhamDto.getDungTich();
            this.tenThuongHieu = sanPhamDto.getTenThuongHieu();
            this.tenDanhMuc = sanPhamDto.getTenDanhMuc();
            this.moTaHuongDau = sanPhamDto.getMoTaHuongDau();
            this.moTaHuongGiua = sanPhamDto.getMoTaHuongGiua();
            this.moTaHuongCuoi = sanPhamDto.getMoTaHuongCuoi();
            this.tenNhomHuong = sanPhamDto.getTenNhomHuong();
            this.phongCachs = sanPhamDto.getPhongCachs();
        }
        this.muiHuongs = muiHuongs;
    }
//    public SanPhamDetailDto(SanPhamDto sanPhamDto, List<MuiHuongDto> muiHuongs) {
//        this.idSanPham = sanPhamDto.getIdSanPham();
//        this.tenSanPham = sanPhamDto.getTenSanPham();
//        this.moTaSanPham = sanPhamDto.getMoTaSanPham();
//        this.idSpct = sanPhamDto.getIdSpct();
//        this.donGia = sanPhamDto.getDonGia();
//        this.soLuongTonKho = sanPhamDto.getSoLuongTonKho();
//        this.dungTich = sanPhamDto.getDungTich();
//        this.tenThuongHieu = sanPhamDto.getTenThuongHieu();
//        this.tenDanhMuc = sanPhamDto.getTenDanhMuc();
//        this.moTaHuongDau = sanPhamDto.getMoTaHuongDau();
//        this.moTaHuongGiua = sanPhamDto.getMoTaHuongGiua();
//        this.moTaHuongCuoi = sanPhamDto.getMoTaHuongCuoi();
//        this.imageURL = sanPhamDto.getimageURL();
//        this.tenNhomHuong = sanPhamDto.getTenNhomHuong();
//        this.phongCachs = sanPhamDto.getPhongCachs();
//        this.muiHuongs = muiHuongs;
//    }

    // Getters và setters
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

    public String getMoTaSanPham() {
        return moTaSanPham;
    }

    public void setMoTaSanPham(String moTaSanPham) {
        this.moTaSanPham = moTaSanPham;
    }

    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
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

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public String getPhongCachs() {
        return phongCachs;
    }

    public void setPhongCachs(String phongCachs) {
        this.phongCachs = phongCachs;
    }

    public List<MuiHuongDto> getMuiHuongs() {
        return muiHuongs;
    }

    public void setMuiHuongs(List<MuiHuongDto> muiHuongs) {
        this.muiHuongs = muiHuongs;
    }
}