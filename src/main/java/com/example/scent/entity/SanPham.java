package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import lombok.NoArgsConstructor;


import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "san_pham")
@Entity
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer idSanPham;

    @Column(name = "trang_thai")
    private Integer trangThai;
    @NotEmpty(message = "Tên sản phẩm không được để trống")
    @Size(max = 100, message = "Tên sản phẩm không được vượt quá 100 ký tự")
    @Column(name = "ten")
    private String tenSanPham;

    @NotEmpty(message = "Mô tả sản phẩm không được để trống")
    @Size(max = 500, message = "Mô tả sản phẩm không được vượt quá 500 ký tự")
    @Column(name = "mo_ta")
    private String moTaSanPham;
    @ManyToOne
    @JoinColumn(name = "id_thuong_hieu")
    private ThuongHieu thuongHieu;

    @ManyToOne
    @JoinColumn(name = "id_nhom_huong")
    private NhomHuong nhomHuong;
    @ManyToOne
    @JoinColumn(name = "id_danh_muc")
    private DanhMuc danhMuc;
    @ManyToOne
    @JoinColumn(name = "id_huong_dau")
    private HuongDau huongDau;

    @ManyToOne
    @JoinColumn(name = "id_huong_giua")
    private HuongGiua huongGiua;
    @ManyToOne
    @JoinColumn(name = "id_huong_cuoi")
    private HuongCuoi huongCuoi;

    @JsonIgnore
    @OneToMany(mappedBy = "sanPham")
    private List<Spct> spcts;
    @JsonIgnore
    @OneToMany(mappedBy = "sanPham")
    private List<HinhAnh> hinhAnhs;
    @JsonIgnore
    @OneToMany(mappedBy = "sanPham")
    private List<DanhGia> danhGias; // Thêm mối quan hệ với DanhGia
    @ManyToMany
    @JoinTable(
            name = "san_pham_phong_cach",
            joinColumns = @JoinColumn(name = "id_san_pham"),
            inverseJoinColumns = @JoinColumn(name = "id_phong_cach")
    )
    private List<PhongCach> phongCachs;
    @JsonIgnore
    @OneToMany(mappedBy = "sanPham")
    private List<SanPhamMuiHuong> sanPhamMuiHuongs;
    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public NhomHuong getNhomHuong() {
        return nhomHuong;
    }

    public void setNhomHuong(NhomHuong nhomHuong) {
        this.nhomHuong = nhomHuong;
    }

    public List<Spct> getSpcts() {
        return spcts;
    }

    public void setSpcts(List<Spct> spcts) {
        this.spcts = spcts;
    }

    public List<HinhAnh> getHinhAnhs() {
        return hinhAnhs;
    }

    public void setHinhAnhs(List<HinhAnh> hinhAnhs) {
        this.hinhAnhs = hinhAnhs;
    }

    public List<DanhGia> getDanhGias() {
        return danhGias;
    }

    public void setDanhGias(List<DanhGia> danhGias) {
        this.danhGias = danhGias;
    }

    public List<PhongCach> getPhongCachs() {
        return phongCachs;
    }

    public void setPhongCachs(List<PhongCach> phongCachs) {
        this.phongCachs = phongCachs;
    }

    public HuongDau getHuongDau() {
        return huongDau;
    }

    public void setHuongDau(HuongDau huongDau) {
        this.huongDau = huongDau;
    }

    public HuongGiua getHuongGiua() {
        return huongGiua;
    }

    public void setHuongGiua(HuongGiua huongGiua) {
        this.huongGiua = huongGiua;
    }

    public HuongCuoi getHuongCuoi() {
        return huongCuoi;
    }

    public void setHuongCuoi(HuongCuoi huongCuoi) {
        this.huongCuoi = huongCuoi;
    }



    public Integer getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        this.idSanPham = idSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getMoTaSanPham() {
        return moTaSanPham;
    }

    public void setMoTaSanPham(String moTaSanPham) {
        this.moTaSanPham = moTaSanPham;
    }

    public ThuongHieu getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(ThuongHieu thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public DanhMuc getDanhMuc() {
        return danhMuc;
    }

    public void setDanhMuc(DanhMuc danhMuc) {
        this.danhMuc = danhMuc;
    }


}