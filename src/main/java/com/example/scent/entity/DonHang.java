package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "don_hang")
@Entity
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotEmpty(message = "Tên người nhận không được để trống")
    @Size(max = 100, message = "Tên người nhận không được vượt quá 100 ký tự")
    @Column(name = "ten_nguoi_nhan_hang")
    private String tenNguoiNhanHang;

    @NotEmpty(message = "Địa chỉ giao hàng không được để trống")
    @Column(name = "dia_chi_giao_hang")
    private String diaChiGiaoHang;

    @NotEmpty(message = "SĐT người nhận không được để trống")
    @Pattern(regexp = "^0.*$", message = "SĐT phải bắt đầu bằng số 0")
    @Pattern(regexp = "^\\d+$", message = "SĐT phải chỉ chứa các chữ số")
    @Pattern(regexp = "^\\d{10,11}$", message = "SĐT phải có từ 10 đến 11 chữ số")
    @Column(name = "sdt_nguoi_nhan")
    private String sdtNguoiNhan;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @NotNull(message = "Tổng tiền không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Tổng tiền phải lớn hơn 0")
    @Pattern(regexp = "^(\\d+|(\\d+\\.\\d{1,4}))$", message = "Tổng tiền phải là số nguyên hoặc số thập phân với tối đa 4 chữ số thập phân")
    @Column(name = "tong_tien", precision = 19, scale = 4)
    private BigDecimal tongTien;

    @NotEmpty(message = "Phương thức vận chuyển không được để trống")
    @Column(name = "phuong_thuc_van_chuyen")
    private String phuongThucVanChuyen;

    @NotEmpty(message = "Trạng thái không được để trống")
    @Column(name = "trang_thai")
    private String trangThai;

    @NotNull(message = "Ngày tạo không được để trống")
    @FutureOrPresent(message = "Ngày tạo phải là ngày hiện tại hoặc tương lai")
    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @NotNull(message = "Ngày vận chuyển không được để trống")
    @Column(name = "ngay_van_chuyen")
    private LocalDateTime ngayVanChuyen;

    @NotEmpty(message = "Phương thức thanh toán không được để trống")
    @Column(name = "phuong_thuc_thanh_toan")
    private String phuongThucThanhToan;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan")
    private TaiKhoan taiKhoan;

    @OneToOne
    @JoinColumn(name = "id_phieu_giam_gia", unique = true)
    private PhieuGiamGia phieuGiamGia;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getPhuongThucVanChuyen() {
        return phuongThucVanChuyen;
    }

    public void setPhuongThucVanChuyen(String phuongThucVanChuyen) {
        this.phuongThucVanChuyen = phuongThucVanChuyen;
    }

    public LocalDateTime getNgayVanChuyen() {
        return ngayVanChuyen;
    }

    public void setNgayVanChuyen(LocalDateTime ngayVanChuyen) {
        this.ngayVanChuyen = ngayVanChuyen;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHang khachHang) {
        this.khachHang = khachHang;
    }



    public PhieuGiamGia getPhieuGiamGia() {
        return phieuGiamGia;
    }

    public void setPhieuGiamGia(PhieuGiamGia phieuGiamGia) {
        this.phieuGiamGia = phieuGiamGia;
    }
}

