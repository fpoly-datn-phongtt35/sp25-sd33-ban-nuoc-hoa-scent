package com.example.scent.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor

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

    public DonHangDTO(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public String getTenNguoiNhanHang() {
        return tenNguoiNhanHang;
    }

    public String getDiaChiGiaoHang() {
        return diaChiGiaoHang;
    }

    public String getSdtNguoiNhan() {
        return sdtNguoiNhan;
    }

    public String getPhuongThucVanChuyen() {
        return phuongThucVanChuyen;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public LocalDateTime getNgayVanChuyen() {
        return ngayVanChuyen;
    }

    public List<OrderItemDto> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public List<String> getImageURL() {
        return imageURL;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public void setTenNguoiNhanHang(String tenNguoiNhanHang) {
        this.tenNguoiNhanHang = tenNguoiNhanHang;
    }

    public void setDiaChiGiaoHang(String diaChiGiaoHang) {
        this.diaChiGiaoHang = diaChiGiaoHang;
    }

    public void setSdtNguoiNhan(String sdtNguoiNhan) {
        this.sdtNguoiNhan = sdtNguoiNhan;
    }

    public void setPhuongThucVanChuyen(String phuongThucVanChuyen) {
        this.phuongThucVanChuyen = phuongThucVanChuyen;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public void setNgayVanChuyen(LocalDateTime ngayVanChuyen) {
        this.ngayVanChuyen = ngayVanChuyen;
    }

    public void setChiTietDonHangs(List<OrderItemDto> chiTietDonHangs) {
        this.chiTietDonHangs = chiTietDonHangs;
    }

    public void setImageURL(List<String> imageURL) {
        this.imageURL = imageURL;
    }

    public void setGhichu(String ghichu) {
        this.ghichu = ghichu;
    }

    public String getGhichu() {
        return ghichu;
    }

    public DonHangDTO(Integer idTaiKhoan, String tenNguoiNhanHang, String diaChiGiaoHang, String sdtNguoiNhan, String phuongThucVanChuyen, String phuongThucThanhToan, LocalDateTime ngayTao, LocalDateTime ngayVanChuyen, List<OrderItemDto> chiTietDonHangs, List<String> imageURL, String ghichu) {
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
    }
}
