package com.example.scent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_tra_hang")
@Data
public class LichSuTraHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_yeu_cau_tra_hang", nullable = false)
    private YeuCauTraHang yeuCauTraHang;

    @Column(name = "thao_tac", nullable = false)
    private Integer thaoTac; // 0: Chờ xác nhận, 1: Xác nhận, 2: Từ chối, 3: Hoàn thành

    @Column(name = "thoi_gian_thao_tac", nullable = false)
    private LocalDateTime thoiGianThaoTac = LocalDateTime.now();
    @Column(name = "trang_thai_cu")
    private Integer trangThaiCu;

    @Column(name = "trang_thai_moi")
    private Integer trangThaiMoi;
    @ManyToOne
    @JoinColumn(name = "id_tai_khoan", nullable = false)
    private TaiKhoan taiKhoan;

    @Column(name = "ghi_chu", length = 255)
    private String ghiChu;

    @Column(name = "ly_do_tu_choi", length = 255)
    private String lyDoTuChoi;
}
