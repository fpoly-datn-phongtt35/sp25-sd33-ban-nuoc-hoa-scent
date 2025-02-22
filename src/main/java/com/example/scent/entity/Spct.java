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
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "spct")
@Entity
public class Spct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải là số dương")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,4})?$", message = "Đơn giá phải là số và không chứa ký tự hoặc chữ cái")
    @Column(name = "don_gia", precision = 19, scale = 4)
    private BigDecimal donGia;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Positive(message = "Số lượng tồn kho phải là số dương")
    @Pattern(regexp = "^[0-9]+$", message = "Số lượng tồn kho phải là số và không chứa ký tự hoặc chữ cái")
    @Column(name = "so_luong_ton_kho")
    private Integer soLuongTonKho;

    @Column(name = "trang_thai")
    private String trangThai;

    @NotNull(message = "Dung tích không được để trống")
    @Positive(message = "Dung tích phải là số dương")
    @Pattern(regexp = "^[0-9]+$", message = "Dung tích phải là số và không chứa ký tự hoặc chữ cái")
    @Column(name = "dung_tich")
    private Integer dungTich;
    @ManyToOne
    @JoinColumn(name = "id_san_pham")
    private SanPham sanPham;




    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }
}
