package com.example.scent.entity.ThongKe;

public class BestSellingProductDTO {
    private Integer idSanPham;
    private String tenSanPham;
    private String thuongHieu;
    private String nhomHuong;
    private String danhMuc;
    private String stockStatus;
    private Integer idSpct;
    private Integer dungTich;
    private Integer soLuongTonKho;
    private Long totalQuantitySold;
    private boolean stockWarning;
    private Long soLuotTraHang;

    public BestSellingProductDTO() {
    }

    public BestSellingProductDTO(Integer idSanPham, String tenSanPham, String thuongHieu, String nhomHuong, String danhMuc,
                                 String stockStatus, Integer idSpct, Integer dungTich, Integer soLuongTonKho,
                                 Long totalQuantitySold, boolean stockWarning, Long soLuotTraHang) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.thuongHieu = thuongHieu;
        this.nhomHuong = nhomHuong;
        this.danhMuc = danhMuc;
        this.stockStatus = stockStatus;
        this.idSpct = idSpct;
        this.dungTich = dungTich;
        this.soLuongTonKho = soLuongTonKho;
        this.totalQuantitySold = totalQuantitySold;
        this.stockWarning = stockWarning;
        this.soLuotTraHang = soLuotTraHang;
    }

    // Getters and setters
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

    public String getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(String thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public String getNhomHuong() {
        return nhomHuong;
    }

    public void setNhomHuong(String nhomHuong) {
        this.nhomHuong = nhomHuong;
    }

    public String getDanhMuc() {
        return danhMuc;
    }

    public void setDanhMuc(String danhMuc) {
        this.danhMuc = danhMuc;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }

    public boolean isStockWarning() {
        return stockWarning;
    }

    public void setStockWarning(boolean stockWarning) {
        this.stockWarning = stockWarning;
    }

    public Long getTotalQuantitySold() {
        return totalQuantitySold;
    }

    public void setTotalQuantitySold(Long totalQuantitySold) {
        this.totalQuantitySold = totalQuantitySold;
    }

    public Long getSoLuotTraHang() {
        return soLuotTraHang;
    }

    public void setSoLuotTraHang(Long soLuotTraHang) {
        this.soLuotTraHang = soLuotTraHang;
    }
}