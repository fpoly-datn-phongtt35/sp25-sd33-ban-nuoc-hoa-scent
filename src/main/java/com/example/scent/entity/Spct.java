package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
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
    private Integer idSpct;


    @Transient // ✅ Không lưu vào database
    private List<String> imageUrl;
    @Column(name = "don_gia", precision = 19, scale = 4)
    private BigDecimal donGia;



    @Column(name = "so_luong_ton_kho")
    private Integer soLuongTonKho;



    @NotNull(message = "Dung tích không được để trống")

    @Column(name = "dung_tich")
    private Integer dungTich;
    @Column(name = "trang_thai")
    private Integer trangThai;
    @JsonIgnore
    @OneToMany(mappedBy = "spct",cascade = CascadeType.ALL)
    private List<ChiTietDonHang> ctdh;

    @JsonIgnore
    @OneToMany(mappedBy = "spct",cascade = CascadeType.ALL)
    private List<YeuCauTraHang> ycth;
    @ManyToOne
    @JoinColumn(name = "id_san_pham")
    private SanPham sanPham;
    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
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

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
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
    public List<String> getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(List<String> imageUrl) {
        this.imageUrl = imageUrl;
    }
}
