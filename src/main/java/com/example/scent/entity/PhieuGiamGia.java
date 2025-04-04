package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
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

@Table(name = "phieu_giam_gia")
@Entity
public class PhieuGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotEmpty(message = "Mã giảm giá không được để trống")
    @Size(max = 50, message = "Mã giảm giá không được vượt quá 50 ký tự")
    @Column(name = "ma_giam_gia")
    private String maGiamGia;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    @DecimalMax(value = "9999.99", message = "Giá trị giảm không được vượt quá 9999.99")
    @Column(name = "gia_tri_giam")
    private BigDecimal giaTriGiam;


    @Column(name = "ngay_bat_dau")
    private LocalDateTime ngayBatDau;

    @Column(name = "gia_tri_toi_da")
    private BigDecimal gia_tri_toi_da;
    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "dieu_kien_ap_dung")
    private Integer dieuKienapDung;



    @Column(name = "ngay_het_han")
    private LocalDateTime ngayHetHan;

    @JsonIgnore
    @OneToMany(mappedBy = "phieuGiamGia")
    private List<DonHang> donHang;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaGiamGia() {
        return maGiamGia;
    }

    public void setMaGiamGia(String maGiamGia) {
        this.maGiamGia = maGiamGia;
    }

    public BigDecimal getGiaTriGiam() {
        return giaTriGiam;
    }

    public void setGiaTriGiam(BigDecimal giaTriGiam) {
        this.giaTriGiam = giaTriGiam;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayHetHan() {
        return ngayHetHan;
    }

    public void setNgayHetHan(LocalDateTime ngayHetHan) {
        this.ngayHetHan = ngayHetHan;
    }

    public List<DonHang> getDonHang() {
        return donHang;
    }

    public void setDonHang(List<DonHang> donHang) {
        this.donHang = donHang;
    }
}