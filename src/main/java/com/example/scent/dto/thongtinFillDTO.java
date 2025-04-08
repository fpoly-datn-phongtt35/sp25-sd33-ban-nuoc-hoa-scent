package com.example.scent.dto;

import java.math.BigDecimal;
import java.util.List;

public class thongtinFillDTO {
    private Integer idTaiKhoan;
    private String tenNguoiNhanHang;
    private String diaChiGiaoHang;
    private String sdtNguoiNhan;
    private BigDecimal phiVanChuyen;
    private List<OrderItemDto> chiTietDonHangs;
    private Integer trungBinhCacCanh =10;
    private Integer maTinh;  // Mã tỉnh
    private Integer maQuan;  // Mã quận
    private String maPhuong;  // Mã phường xã

    public thongtinFillDTO(Integer idTaiKhoan, String tenNguoiNhanHang, String diaChiGiaoHang, String sdtNguoiNhan, BigDecimal phiVanChuyen, List<OrderItemDto> chiTietDonHangs, Integer trungBinhCacCanh, Integer maTinh, Integer maQuan, String maPhuong) {
        this.idTaiKhoan = idTaiKhoan;
        this.tenNguoiNhanHang = tenNguoiNhanHang;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.phiVanChuyen = phiVanChuyen;
        this.chiTietDonHangs = chiTietDonHangs;
        this.trungBinhCacCanh = trungBinhCacCanh;
        this.maTinh = maTinh;
        this.maQuan = maQuan;
        this.maPhuong = maPhuong;
    }

    public List<OrderItemDto> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public void setChiTietDonHangs(List<OrderItemDto> chiTietDonHangs) {
        this.chiTietDonHangs = chiTietDonHangs;
    }

    public Integer getTrungBinhCacCanh() {
        return trungBinhCacCanh;
    }

    public void setTrungBinhCacCanh(Integer trungBinhCacCanh) {
        this.trungBinhCacCanh = trungBinhCacCanh;
    }

    public Integer getMaTinh() {
        return maTinh;
    }

    public void setMaTinh(Integer maTinh) {
        this.maTinh = maTinh;
    }

    public Integer getMaQuan() {
        return maQuan;
    }

    public void setMaQuan(Integer maQuan) {
        this.maQuan = maQuan;
    }

    public String getMaPhuong() {
        return maPhuong;
    }

    public void setMaPhuong(String maPhuong) {
        this.maPhuong = maPhuong;
    }

    public BigDecimal getPhiVanChuyen() {
        return phiVanChuyen;
    }

    public void setPhiVanChuyen(BigDecimal phiVanChuyen) {
        this.phiVanChuyen = phiVanChuyen;
    }

    public thongtinFillDTO() {
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public String getTenNguoiNhanHang() {
        return tenNguoiNhanHang;
    }

    public void setTenNguoiNhanHang(String tenNguoiNhanHang) {
        this.tenNguoiNhanHang = tenNguoiNhanHang;
    }

    public String getDiaChiGiaoHang() {
        return diaChiGiaoHang;
    }

    public void setDiaChiGiaoHang(String diaChiGiaoHang) {
        this.diaChiGiaoHang = diaChiGiaoHang;
    }

    public String getSdtNguoiNhan() {
        return sdtNguoiNhan;
    }

    public void setSdtNguoiNhan(String sdtNguoiNhan) {
        this.sdtNguoiNhan = sdtNguoiNhan;
    }
}
