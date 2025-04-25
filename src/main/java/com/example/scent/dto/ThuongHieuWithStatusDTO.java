package com.example.scent.dto;

import lombok.Data;

@Data
public class ThuongHieuWithStatusDTO {
    private Integer id;
    private String tenThuongHieu;
    private String quocGia;
    private String moTa;
    private boolean hasProduct;
    private Long soLuongSanPham; // Thêm trường số lượng sản phẩm
    private boolean canRestore; // Thêm trường canRestore
    public ThuongHieuWithStatusDTO(Integer id, String tenThuongHieu, String quocGia, String moTa,
                                   boolean hasProduct, Long soLuongSanPham, boolean canRestore) {
        this.id = id;
        this.tenThuongHieu = tenThuongHieu;
        this.quocGia = quocGia;
        this.moTa = moTa;
        this.hasProduct = hasProduct;
        this.soLuongSanPham = soLuongSanPham != null ? soLuongSanPham : 0L;
        this.canRestore = canRestore;
    }

    public ThuongHieuWithStatusDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public String getQuocGia() {
        return quocGia;
    }

    public void setQuocGia(String quocGia) {
        this.quocGia = quocGia;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public boolean isHasProduct() {
        return hasProduct;
    }

    public void setHasProduct(boolean hasProduct) {
        this.hasProduct = hasProduct;
    }

    public Long getSoLuongSanPham() {
        return soLuongSanPham;
    }

    public void setSoLuongSanPham(Long soLuongSanPham) {
        this.soLuongSanPham = soLuongSanPham != null ? soLuongSanPham : 0L; // Nếu null, gán 0
    }
}
