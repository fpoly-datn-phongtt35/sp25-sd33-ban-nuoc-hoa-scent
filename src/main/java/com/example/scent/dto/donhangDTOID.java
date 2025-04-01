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

public class donhangDTOID {

        private Integer idTaiKhoan;
        private String tenNguoiNhanHang;
    private Integer maDonHang;
        private String diaChiGiaoHang;
        private String sdtNguoiNhan;
        private String phuongThucVanChuyen;
        private String phuongThucThanhToan;
        private LocalDateTime ngayTao =LocalDateTime.now();
        private LocalDateTime ngayVanChuyen;
        private List<OrderItemDTOID> chiTietDonHangs;
        private List<String> imageURL;
        private String ghichu;
        private BigDecimal tongTien;
    private Integer trangThai;
        private BigDecimal phiVanChuyen;

    public donhangDTOID() {
    }

    public donhangDTOID(Integer idTaiKhoan, String tenNguoiNhanHang, Integer maDonHang, String diaChiGiaoHang, String sdtNguoiNhan, String phuongThucVanChuyen, String phuongThucThanhToan, LocalDateTime ngayTao, LocalDateTime ngayVanChuyen, List<OrderItemDTOID> chiTietDonHangs, List<String> imageURL, String ghichu, BigDecimal tongTien, Integer trangThai, BigDecimal phiVanChuyen) {
        this.idTaiKhoan = idTaiKhoan;
        this.tenNguoiNhanHang = tenNguoiNhanHang;
        this.maDonHang = maDonHang;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.phuongThucVanChuyen = phuongThucVanChuyen;
        this.phuongThucThanhToan = phuongThucThanhToan;
        this.ngayTao = ngayTao;
        this.ngayVanChuyen = ngayVanChuyen;
        this.chiTietDonHangs = chiTietDonHangs;
        this.imageURL = imageURL;
        this.ghichu = ghichu;
        this.tongTien = tongTien;
        this.trangThai = trangThai;
        this.phiVanChuyen = phiVanChuyen;
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

    public Integer getMaDonHang() {
        return maDonHang;
    }

    public void setMaDonHang(Integer maDonHang) {
        this.maDonHang = maDonHang;
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

    public List<OrderItemDTOID> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public void setChiTietDonHangs(List<OrderItemDTOID> chiTietDonHangs) {
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

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public BigDecimal getPhiVanChuyen() {
        return phiVanChuyen;
    }

    public void setPhiVanChuyen(BigDecimal phiVanChuyen) {
        this.phiVanChuyen = phiVanChuyen;
    }
}
