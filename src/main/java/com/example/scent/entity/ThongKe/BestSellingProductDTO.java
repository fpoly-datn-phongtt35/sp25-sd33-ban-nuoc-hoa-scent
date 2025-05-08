package com.example.scent.entity.ThongKe;
import java.math.BigDecimal;

public class BestSellingProductDTO {
    // Product details from SanPham
    private Integer idSanPham;
    private String tenSanPham;
    private String moTaSanPham;
    private String thuongHieu;
    private String nhomHuong;
    private String danhMuc;
    private String huongDau;
    private String huongGiua;
    private String huongCuoi;
    private String stockStatus;
    // Product variant details from Spct
    private Integer idSpct;
    private Integer dungTich;
    private Integer soLuongTonKho;
    private Long totalQuantitySold;
    private boolean stockWarning; // True if soLuongTonKho < 7

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public void setTotalQuantitySold(Long totalQuantitySold) {
        this.totalQuantitySold = totalQuantitySold;
    }

    // Sales statistics

    // Constructor


    public BestSellingProductDTO(Integer idSanPham, String tenSanPham, String moTaSanPham, String thuongHieu, String nhomHuong, String danhMuc, String huongDau, String huongGiua, String huongCuoi, String stockStatus, Integer idSpct, Integer dungTich, Integer soLuongTonKho, Long totalQuantitySold, boolean stockWarning) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.moTaSanPham = moTaSanPham;
        this.thuongHieu = thuongHieu;
        this.nhomHuong = nhomHuong;
        this.danhMuc = danhMuc;
        this.huongDau = huongDau;
        this.huongGiua = huongGiua;
        this.huongCuoi = huongCuoi;
        this.stockStatus = stockStatus;
        this.idSpct = idSpct;
        this.dungTich = dungTich;
        this.soLuongTonKho = soLuongTonKho;
        this.totalQuantitySold = totalQuantitySold;
        this.stockWarning = stockWarning;
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

    public String getMoTaSanPham() {
        return moTaSanPham;
    }

    public void setMoTaSanPham(String moTaSanPham) {
        this.moTaSanPham = moTaSanPham;
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

    public String getHuongDau() {
        return huongDau;
    }

    public void setHuongDau(String huongDau) {
        this.huongDau = huongDau;
    }

    public String getHuongGiua() {
        return huongGiua;
    }

    public void setHuongGiua(String huongGiua) {
        this.huongGiua = huongGiua;
    }

    public String getHuongCuoi() {
        return huongCuoi;
    }

    public void setHuongCuoi(String huongCuoi) {
        this.huongCuoi = huongCuoi;
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

    public long getTotalQuantitySold() {
        return totalQuantitySold;
    }

    public void setTotalQuantitySold(long totalQuantitySold) {
        this.totalQuantitySold = totalQuantitySold;
    }
}
