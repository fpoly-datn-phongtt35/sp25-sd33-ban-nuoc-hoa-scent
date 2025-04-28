package com.example.scent.entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "yeu_cau_tra_hang")
@Data
@Getter
@Setter
public class YeuCauTraHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_don_hang", nullable = false)
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan", nullable = false)
    private TaiKhoan taiKhoan;

    @ManyToOne
    @JoinColumn(name = "id_spct", nullable = false)
    private Spct spct;

    @Column(name = "so_luong")
    private Integer soLuong;
    @Column(name = "trangThai")
    private Integer trangThai;//0: Chờ xác nhận, 1: Xác nhận, 2: Từ chối, 3: Hoàn thành
    @Column(name = "ly_do_tra_hang", nullable = false, length = 255)
    private String lyDoTraHang;

    @Column(name = "tinh_trang_hang", nullable = false, length = 20)
    private String tinhTrangHang; // NguyenVen, HuHong

    @ElementCollection
    @CollectionTable(
            name = "hinh_anh_yeu_cau_tra_hang",
            joinColumns = @JoinColumn(name = "id_yeu_cau_tra_hang")
    )
    @Column(name = "url_hinh_anh", columnDefinition = "NVARCHAR(255)")
    private List<String> hinhAnhUrls;
    @Column(name = "hinh_thuc_tra_hang", nullable = false, length = 20)
    private String hinhThucTraHang; // TaiCuaHang, QuaVanChuyen

    @Column(name = "ngay_yeu_cau", nullable = false)
    private LocalDateTime ngayYeuCau = LocalDateTime.now();

    @Column(name = "ngay_duyet")
    private LocalDateTime ngayDuyet;
    @Column(name = "urlVideo")
    private String urlVideo;
    @ManyToOne
    @JoinColumn(name = "id_tai_khoan_duyet")
    private TaiKhoan taiKhoanDuyet;

    @Column(name = "ghi_chu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;
}