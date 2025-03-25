package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

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

//    @Column(name = "ma_van_don")
//    private String maVanDon;

    @NotEmpty(message = "SĐT người nhận không được để trống")
    @Pattern(regexp = "^0.*$", message = "SĐT phải bắt đầu bằng số 0")
    @Pattern(regexp = "^\\d+$", message = "SĐT phải chỉ chứa các chữ số")
    @Pattern(regexp = "^\\d{10,11}$", message = "SĐT phải có từ 10 đến 11 chữ số")
    @Column(name = "sdt_nguoi_nhan")
    private String sdtNguoiNhan;

    @Column(name = "ghi_chu")
    private String ghiChu;
//    @Column(name = "loai_don_hang")
//    private String loaiDonHang;

    @NotNull(message = "Tổng tiền không được để trống")

    @Column(name = "tong_tien", precision = 19, scale = 4)
    private BigDecimal tongTien;

    @NotEmpty(message = "Phương thức vận chuyển không được để trống")
    @Column(name = "phuong_thuc_van_chuyen")
    private String phuongThucVanChuyen;

    @NotNull(message = "Ngày tạo không được để trống")

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ly_do_huy")
    private String lyDoHuy;


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

    @Column(name = "trang_thai")
    private Integer trangThai;


    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    @BatchSize(size = 10)
    private List<ChiTietDonHang> chiTietDonHangs;

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

//    public String getMaVanDon() {
//        return maVanDon;
//    }
//
//    public void setMaVanDon(String maVanDon) {
//        this.maVanDon = maVanDon;
//    }

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

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public List<ChiTietDonHang> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public void setChiTietDonHangs(List<ChiTietDonHang> chiTietDonHangs) {
        this.chiTietDonHangs = chiTietDonHangs;
    }



    public PhieuGiamGia getPhieuGiamGia() {
        return phieuGiamGia;
    }

    public void setPhieuGiamGia(PhieuGiamGia phieuGiamGia) {
        this.phieuGiamGia = phieuGiamGia;
    }

    public String getLyDoHuy() {
        return lyDoHuy;
    }

    public void setLyDoHuy(String lyDoHuy) {
        this.lyDoHuy = lyDoHuy;
    }
}

