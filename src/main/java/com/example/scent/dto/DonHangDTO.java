package com.example.scent.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter




public class DonHangDTO {
    private Integer idTaiKhoan;
    private String tenNguoiNhanHang;
    private String diaChiGiaoHang;
    private String sdtNguoiNhan;
    private String phuongThucVanChuyen;
    private String phuongThucThanhToan;
    private LocalDateTime ngayTao =LocalDateTime.now();
    private LocalDateTime ngayVanChuyen;
    private List<OrderItemDto> chiTietDonHangs;
    private List<String> imageURL;
    private String ghichu;
    private Integer maTinh;  // Mã tỉnh
    private Integer maQuan;  // Mã quận
    private String maPhuong;  // Mã phường xã
    private BigDecimal phiVanChuyen;
    private Integer trungBinhCacCanh =10;
    private String maGiamGia;
    private BigDecimal tongTien;
    private BigDecimal soTienGiam;
private Integer luongBan = 1;

    public Integer getLuongBan() {
        return luongBan;
    }

    public void setLuongBan(Integer luongBan) {
        this.luongBan = luongBan;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public BigDecimal getSoTienGiam() {
        return soTienGiam;
    }

    public void setSoTienGiam(BigDecimal soTienGiam) {
        this.soTienGiam = soTienGiam;
    }

    public DonHangDTO() {
    }

    public String getMaGiamGia() {
        return maGiamGia;
    }

    public void setMaGiamGia(String maGiamGia) {
        this.maGiamGia = maGiamGia;
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

    public String getPhuongThucVanChuyen() {
        return phuongThucVanChuyen;
    }

    public void setPhuongThucVanChuyen(String phuongThucVanChuyen) {
        this.phuongThucVanChuyen = phuongThucVanChuyen;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public LocalDateTime getNgayVanChuyen() {
        return ngayVanChuyen;
    }

    public void setNgayVanChuyen(LocalDateTime ngayVanChuyen) {
        this.ngayVanChuyen = ngayVanChuyen;
    }

    public List<OrderItemDto> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public void setChiTietDonHangs(List<OrderItemDto> chiTietDonHangs) {
        this.chiTietDonHangs = chiTietDonHangs;
    }

    public List<String> getImageURL() {
        return imageURL;
    }

    public void setImageURL(List<String> imageURL) {
        this.imageURL = imageURL;
    }

    public String getGhichu() {
        return ghichu;
    }

    public void setGhichu(String ghichu) {
        this.ghichu = ghichu;
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

    public Integer getTrungBinhCacCanh() {
        return trungBinhCacCanh;
    }

    public void setTrungBinhCacCanh(Integer trungBinhCacCanh) {
        this.trungBinhCacCanh = trungBinhCacCanh;
    }

    public DonHangDTO(Integer idTaiKhoan, String tenNguoiNhanHang, String diaChiGiaoHang, String sdtNguoiNhan, String phuongThucVanChuyen, String phuongThucThanhToan, LocalDateTime ngayTao, LocalDateTime ngayVanChuyen, List<OrderItemDto> chiTietDonHangs, List<String> imageURL, String ghichu, Integer maTinh, Integer maQuan, String maPhuong, BigDecimal phiVanChuyen, Integer trungBinhCacCanh, String maGiamGia, BigDecimal tongTien, BigDecimal soTienGiam, Integer luongBan) {
        this.idTaiKhoan = idTaiKhoan;
        this.tenNguoiNhanHang = tenNguoiNhanHang;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.phuongThucVanChuyen = phuongThucVanChuyen;
        this.phuongThucThanhToan = phuongThucThanhToan;
        this.ngayTao = ngayTao;
        this.ngayVanChuyen = ngayVanChuyen;
        this.chiTietDonHangs = chiTietDonHangs;
        this.imageURL = imageURL;
        this.ghichu = ghichu;
        this.maTinh = maTinh;
        this.maQuan = maQuan;
        this.maPhuong = maPhuong;
        this.phiVanChuyen = phiVanChuyen;
        this.trungBinhCacCanh = trungBinhCacCanh;
        this.maGiamGia = maGiamGia;
        this.tongTien = tongTien;
        this.soTienGiam = soTienGiam;
        this.luongBan = luongBan;
    }
}
