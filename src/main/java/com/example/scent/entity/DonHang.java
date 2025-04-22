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


@Table(name = "don_hang")
@Entity
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;


    @Column(name = "ten_nguoi_nhan_hang")
    private String tenNguoiNhanHang;

    @Column(name = "dia_chi_giao_hang")
    private String diaChiGiaoHang;



    @Column(name = "sdt_nguoi_nhan")
    private String sdtNguoiNhan;

    @Column(name = "ghi_chu")
    private String ghiChu;



    @Column(name = "tong_tien", precision = 19, scale = 4)
    private BigDecimal tongTien;
    @Transient
    private BigDecimal soTienGiam;
@Transient
private Integer trungBinhCacCanh =10;

    @Column(name = "phuong_thuc_van_chuyen")
    private String phuongThucVanChuyen;


    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ly_do_huy")
    private String lyDoHuy;
    @Column(name = "luong_ban")
    private Integer luongBan;


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

    @ManyToOne
    @JoinColumn(name = "id_phieu_giam_gia",unique = true)
    private PhieuGiamGia phieuGiamGia;

    @Column(name = "trang_thai")
    private Integer trangThai;


    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    @BatchSize(size = 10)
    private List<ChiTietDonHang> chiTietDonHangs;
    @Column(name = "ma_tinh")
    private Integer maTinh; // Mã tỉnh

    @Column(name = "ma_quan")
    private Integer maQuan; // Mã quận

    @Column(name = "ma_phuong")
    private String maPhuong; // Liên kết với bảng Phuong
    @Column(name = "trong_luong")
    private Integer trongLuong;  // Trọng lượng của kiện hàng (gram)

    @Column(name = "chieu_dai")
    private Integer chieuDai;  // Chiều dài (cm)

    @Column(name = "chieu_rong")
    private Integer chieuRong;  // Chiều rộng (cm)

    @Column(name = "chieu_cao")
    private Integer chieuCao;  // Chiều cao (cm)

    @Column(name = "phi_van_chuyen", precision = 19, scale = 4)
    private BigDecimal phiVanChuyen;

    @Column(name = "email_nguoi_nhan")
    private String emailNguoiNhan;


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

    public DonHang() {
    }

    public DonHang(Integer id,String emailNguoiNhan, String tenNguoiNhanHang, String diaChiGiaoHang, String sdtNguoiNhan, String ghiChu, BigDecimal tongTien, BigDecimal soTienGiam, String phuongThucVanChuyen, LocalDateTime ngayTao, String lyDoHuy, Integer luongBan, LocalDateTime ngayVanChuyen, String phuongThucThanhToan, KhachHang khachHang, TaiKhoan taiKhoan, PhieuGiamGia phieuGiamGia, Integer trangThai, List<ChiTietDonHang> chiTietDonHangs, Integer maTinh, Integer maQuan, String maPhuong, Integer trongLuong, Integer chieuDai, Integer chieuRong, Integer chieuCao, BigDecimal phiVanChuyen) {
        this.id = id;
        this.emailNguoiNhan = emailNguoiNhan;
        this.tenNguoiNhanHang = tenNguoiNhanHang;
        this.diaChiGiaoHang = diaChiGiaoHang;
        this.sdtNguoiNhan = sdtNguoiNhan;
        this.ghiChu = ghiChu;
        this.tongTien = tongTien;
        this.soTienGiam = soTienGiam;
        this.phuongThucVanChuyen = phuongThucVanChuyen;
        this.ngayTao = ngayTao;
        this.lyDoHuy = lyDoHuy;
        this.luongBan = luongBan;
        this.ngayVanChuyen = ngayVanChuyen;
        this.phuongThucThanhToan = phuongThucThanhToan;
        this.khachHang = khachHang;
        this.taiKhoan = taiKhoan;
        this.phieuGiamGia = phieuGiamGia;
        this.trangThai = trangThai;
        this.chiTietDonHangs = chiTietDonHangs;
        this.maTinh = maTinh;
        this.maQuan = maQuan;
        this.maPhuong = maPhuong;
        this.trongLuong = trongLuong;
        this.chieuDai = chieuDai;
        this.chieuRong = chieuRong;
        this.chieuCao = chieuCao;
        this.phiVanChuyen = phiVanChuyen;
    }

    public Integer getId() {
        return id;
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

    public Integer getTrongLuong() {
        return trongLuong;
    }

    public void setTrongLuong(Integer trongLuong) {
        this.trongLuong = trongLuong;
    }

    public Integer getChieuDai() {
        return chieuDai;
    }

    public void setChieuDai(Integer chieuDai) {
        this.chieuDai = chieuDai;
    }

    public Integer getChieuRong() {
        return chieuRong;
    }

    public void setChieuRong(Integer chieuRong) {
        this.chieuRong = chieuRong;
    }

    public Integer getChieuCao() {
        return chieuCao;
    }

    public void setChieuCao(Integer chieuCao) {
        this.chieuCao = chieuCao;
    }

    public BigDecimal getPhiVanChuyen() {
        return phiVanChuyen;
    }

    public void setPhiVanChuyen(BigDecimal phiVanChuyen) {
        this.phiVanChuyen = phiVanChuyen;
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

    public BigDecimal getSoTienGiam() {
        return soTienGiam;
    }

    public void setSoTienGiam(BigDecimal soTienGiam) {
        this.soTienGiam = soTienGiam;
    }

    public Integer getLuongBan() {
        return luongBan;
    }

    public void setLuongBan(Integer luongBan) {
        this.luongBan = luongBan;
    }

    public Integer getTrungBinhCacCanh() {
        return trungBinhCacCanh;
    }

    public void setTrungBinhCacCanh(Integer trungBinhCacCanh) {
        this.trungBinhCacCanh = trungBinhCacCanh;
    }
}

