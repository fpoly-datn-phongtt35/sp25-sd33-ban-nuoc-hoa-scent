package com.example.scent.dto;

import lombok.Data;

@Data
public class DefectiveProductDTO {
    private Integer idYeuCau;
    private Integer idSpct;
    private String tenSanPham;
    private String tenThuongHieu;
    private Integer idThuongHieu;
    private Integer soLuong;
    private String tinhTrangHang;
    private String lyDoTraHang;

    public DefectiveProductDTO() {
    }

    public DefectiveProductDTO(Integer idYeuCau, Integer idSpct, String tenSanPham, String tenThuongHieu, Integer idThuongHieu, Integer soLuong, String tinhTrangHang, String lyDoTraHang) {
        this.idYeuCau = idYeuCau;
        this.idSpct = idSpct;
        this.tenSanPham = tenSanPham;
        this.tenThuongHieu = tenThuongHieu;
        this.idThuongHieu = idThuongHieu;
        this.soLuong = soLuong;
        this.tinhTrangHang = tinhTrangHang;
        this.lyDoTraHang = lyDoTraHang;
    }

    public Integer getIdYeuCau() {
        return idYeuCau;
    }

    public void setIdYeuCau(Integer idYeuCau) {
        this.idYeuCau = idYeuCau;
    }

    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public Integer getIdThuongHieu() {
        return idThuongHieu;
    }

    public void setIdThuongHieu(Integer idThuongHieu) {
        this.idThuongHieu = idThuongHieu;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getTinhTrangHang() {
        return tinhTrangHang;
    }

    public void setTinhTrangHang(String tinhTrangHang) {
        this.tinhTrangHang = tinhTrangHang;
    }

    public String getLyDoTraHang() {
        return lyDoTraHang;
    }

    public void setLyDoTraHang(String lyDoTraHang) {
        this.lyDoTraHang = lyDoTraHang;
    }
}
