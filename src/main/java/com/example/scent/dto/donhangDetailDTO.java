package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;




public class donhangDetailDTO {
    private Integer donHangId;
    private String tenNguoiNhan;
    private String diaChiGiaoHang;
    private String sdtNguoiNhan;

    private BigDecimal tongTien;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayVanChuyen;
    private String phuongThucVanChuyen;
    private String phuongThucThanhToan;
    private String tenSanPham;
    private String moTaSanPham;
    private Integer dungTich;
    private BigDecimal donGiaSPCT;
    // Số lượng sản phẩm đặt mua
    private Integer soLuong;
    private String hinhAnh;

    @Override
    public String toString() {
        return "donhangDetailDTO{" +
                "donHangId=" + donHangId +
                ", tenNguoiNhan='" + tenNguoiNhan + '\'' +
                ", diaChiGiaoHang='" + diaChiGiaoHang + '\'' +
                ", sdtNguoiNhan='" + sdtNguoiNhan + '\'' +
                ", tongTien=" + tongTien +
                ", ngayTao=" + ngayTao +
                ", ngayVanChuyen=" + ngayVanChuyen +
                ", phuongThucVanChuyen='" + phuongThucVanChuyen + '\'' +
                ", phuongThucThanhToan='" + phuongThucThanhToan + '\'' +
                ", tenSanPham='" + tenSanPham + '\'' +
                ", moTaSanPham='" + moTaSanPham + '\'' +
                ", dungTich=" + dungTich +
                ", donGiaSPCT=" + donGiaSPCT +
                ", soLuong=" + soLuong +
                ", hinhAnh='" + hinhAnh + '\'' +
                '}';
    }

    public donhangDetailDTO(Integer donHangId, String tenNguoiNhan, String diaChiGiaoHang, String sdtNguoiNhan, BigDecimal tongTien, LocalDateTime ngayTao, LocalDateTime ngayVanChuyen, String phuongThucVanChuyen, String phuongThucThanhToan, String tenSanPham, String moTaSanPham, Integer dungTich, BigDecimal donGiaSPCT, Integer soLuong, String hinhAnh) {
        this.donHangId = donHangId;
        this.tenNguoiNhan = tenNguoiNhan;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.tongTien = tongTien;
        this.ngayTao = ngayTao;
        this.ngayVanChuyen = ngayVanChuyen;
        this.phuongThucVanChuyen = phuongThucVanChuyen;
        this.phuongThucThanhToan = phuongThucThanhToan;
        this.tenSanPham = tenSanPham;
        this.moTaSanPham = moTaSanPham;
        this.dungTich = dungTich;
        this.donGiaSPCT = donGiaSPCT;
        this.soLuong = soLuong;
        this.hinhAnh = hinhAnh;
    }

    public Integer getDonHangId() {
        return donHangId;
    }

    public void setDonHangId(Integer donHangId) {
        this.donHangId = donHangId;
    }

    public String getTenNguoiNhan() {
        return tenNguoiNhan;
    }

    public void setTenNguoiNhan(String tenNguoiNhan) {
        this.tenNguoiNhan = tenNguoiNhan;
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

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
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

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public BigDecimal getDonGiaSPCT() {
        return donGiaSPCT;
    }

    public void setDonGiaSPCT(BigDecimal donGiaSPCT) {
        this.donGiaSPCT = donGiaSPCT;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getHinhAnh() {
        return hinhAnh;
    }

    public void setHinhAnh(String hinhAnh) {
        this.hinhAnh = hinhAnh;
    }

    public donhangDetailDTO() {
    }
}
