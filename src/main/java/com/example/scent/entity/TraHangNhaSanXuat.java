package com.example.scent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tra_hang_nha_san_xuat")
@Data
public class TraHangNhaSanXuat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_yeu_cau_tra_hang", nullable = false)
    private YeuCauTraHang yeuCauTraHang;

    @ManyToOne
    @JoinColumn(name = "id_thuong_hieu", nullable = false)
    private ThuongHieu thuongHieu;

    @Column(name = "ngay_gui_tra")
    private LocalDateTime ngayGuiTra;

    @Column(name = "trang_thai_gui", nullable = false)
    private Integer trangThaiGui; // 0: Chờ gửi, 1: Đã gửi, 2: Đã nhận

    @Column(name = "ghi_chu", length = 255)
    private String ghiChu;
}
