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

    public ThongKeDonHangDTO(BigDecimal tongDoanhThu, BigDecimal doanhThuOnline, BigDecimal doanhThuOffline,
                             long onlineHoanThanh, long onlineHuy, long offlineHoanThanh, long offlineHuy,
                             long soLuongDon) {
        this.tongDoanhThu = tongDoanhThu;
        this.doanhThuOnline = doanhThuOnline;
        this.doanhThuOffline = doanhThuOffline;
        this.onlineHoanThanh = onlineHoanThanh;
        this.onlineHuy = onlineHuy;
        this.offlineHoanThanh = offlineHoanThanh;
        this.offlineHuy = offlineHuy;
        this.soLuongDon = soLuongDon;
    }

    // Getters and setters
    public BigDecimal getTongDoanhThu() { return tongDoanhThu; }
    public void setTongDoanhThu(BigDecimal tongDoanhThu) { this.tongDoanhThu = tongDoanhThu; }
    public BigDecimal getDoanhThuOnline() { return doanhThuOnline; }
    public void setDoanhThuOnline(BigDecimal doanhThuOnline) { this.doanhThuOnline = doanhThuOnline; }
    public BigDecimal getDoanhThuOffline() { return doanhThuOffline; }
    public void setDoanhThuOffline(BigDecimal doanhThuOffline) { this.doanhThuOffline = doanhThuOffline; }
    public long getOnlineHoanThanh() { return onlineHoanThanh; }
    public void setOnlineHoanThanh(long onlineHoanThanh) { this.onlineHoanThanh = onlineHoanThanh; }
    public long getOnlineHuy() { return onlineHuy; }
    public void setOnlineHuy(long onlineHuy) { this.onlineHuy = onlineHuy; }
    public long getOfflineHoanThanh() { return offlineHoanThanh; }
    public void setOfflineHoanThanh(long offlineHoanThanh) { this.offlineHoanThanh = offlineHoanThanh; }
    public long getOfflineHuy() { return offlineHuy; }
    public void setOfflineHuy(long offlineHuy) { this.offlineHuy = offlineHuy; }
    public long getSoLuongDon() { return soLuongDon; }
    public void setSoLuongDon(long soLuongDon) { this.soLuongDon = soLuongDon; }
}
