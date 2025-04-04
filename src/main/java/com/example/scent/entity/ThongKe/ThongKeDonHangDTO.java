package com.example.scent.entity.ThongKe;

import java.math.BigDecimal;

public class ThongKeDonHangDTO {
    private BigDecimal tongDoanhThu;
    private BigDecimal doanhThuOnline;
    private BigDecimal doanhThuOffline;
    private long onlineHoanThanh;
    private long onlineHuy;
    private long offlineHoanThanh;
    private long offlineHuy;
    private long soLuongDon;
    private long soLuongDonOnline; // Thêm số lượng đơn hàng online
    private long soLuongDonOffline; // Thêm số lượng đơn hàng offline
    private Double tiLeTangTruongDoanhThu; // Thêm tỉ lệ tăng trưởng doanh thu

    // Constructor
    public ThongKeDonHangDTO(BigDecimal tongDoanhThu, BigDecimal doanhThuOnline, BigDecimal doanhThuOffline,
                             long onlineHoanThanh, long onlineHuy, long offlineHoanThanh, long offlineHuy,
                             long soLuongDon, long soLuongDonOnline, long soLuongDonOffline, Double tiLeTangTruongDoanhThu) {
        this.tongDoanhThu = tongDoanhThu;
        this.doanhThuOnline = doanhThuOnline;
        this.doanhThuOffline = doanhThuOffline;
        this.onlineHoanThanh = onlineHoanThanh;
        this.onlineHuy = onlineHuy;
        this.offlineHoanThanh = offlineHoanThanh;
        this.offlineHuy = offlineHuy;
        this.soLuongDon = soLuongDon;
        this.soLuongDonOnline = soLuongDonOnline;
        this.soLuongDonOffline = soLuongDonOffline;
        this.tiLeTangTruongDoanhThu = tiLeTangTruongDoanhThu;
    }

    // Getters and Setters
    public BigDecimal getTongDoanhThu() {
        return tongDoanhThu;
    }

    public void setTongDoanhThu(BigDecimal tongDoanhThu) {
        this.tongDoanhThu = tongDoanhThu;
    }

    public BigDecimal getDoanhThuOnline() {
        return doanhThuOnline;
    }

    public void setDoanhThuOnline(BigDecimal doanhThuOnline) {
        this.doanhThuOnline = doanhThuOnline;
    }

    public BigDecimal getDoanhThuOffline() {
        return doanhThuOffline;
    }

    public void setDoanhThuOffline(BigDecimal doanhThuOffline) {
        this.doanhThuOffline = doanhThuOffline;
    }

    public long getOnlineHoanThanh() {
        return onlineHoanThanh;
    }

    public void setOnlineHoanThanh(long onlineHoanThanh) {
        this.onlineHoanThanh = onlineHoanThanh;
    }

    public long getOnlineHuy() {
        return onlineHuy;
    }

    public void setOnlineHuy(long onlineHuy) {
        this.onlineHuy = onlineHuy;
    }

    public long getOfflineHoanThanh() {
        return offlineHoanThanh;
    }

    public void setOfflineHoanThanh(long offlineHoanThanh) {
        this.offlineHoanThanh = offlineHoanThanh;
    }

    public long getOfflineHuy() {
        return offlineHuy;
    }

    public void setOfflineHuy(long offlineHuy) {
        this.offlineHuy = offlineHuy;
    }

    public long getSoLuongDon() {
        return soLuongDon;
    }

    public void setSoLuongDon(long soLuongDon) {
        this.soLuongDon = soLuongDon;
    }

    public long getSoLuongDonOnline() {
        return soLuongDonOnline;
    }

    public void setSoLuongDonOnline(long soLuongDonOnline) {
        this.soLuongDonOnline = soLuongDonOnline;
    }

    public long getSoLuongDonOffline() {
        return soLuongDonOffline;
    }

    public void setSoLuongDonOffline(long soLuongDonOffline) {
        this.soLuongDonOffline = soLuongDonOffline;
    }

    public Double getTiLeTangTruongDoanhThu() {
        return tiLeTangTruongDoanhThu;
    }

    public void setTiLeTangTruongDoanhThu(Double tiLeTangTruongDoanhThu) {
        this.tiLeTangTruongDoanhThu = tiLeTangTruongDoanhThu;
    }
}
