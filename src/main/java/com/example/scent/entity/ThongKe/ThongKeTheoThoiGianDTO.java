package com.example.scent.entity.ThongKe;

import java.math.BigDecimal;

public class ThongKeTheoThoiGianDTO {
    private String thoiGian; // Ngày, tuần (năm-tuần), tháng (yyyy-MM), hoặc năm
    private BigDecimal tongDoanhThu;
    private BigDecimal doanhThuOnline;
    private BigDecimal doanhThuOffline;
    private long onlineHoanThanh;
    private long onlineHuy;
    private long offlineHoanThanh;
    private long offlineHuy;
    private long soLuongDon;
    private Double tiLeTangTruongDoanhThu; // Tỉ lệ tăng trưởng doanh thu (%)

    public ThongKeTheoThoiGianDTO(String thoiGian, BigDecimal tongDoanhThu, BigDecimal doanhThuOnline, BigDecimal doanhThuOffline,
                                  long onlineHoanThanh, long onlineHuy, long offlineHoanThanh, long offlineHuy,
                                  long soLuongDon, Double tiLeTangTruongDoanhThu) {
        this.thoiGian = thoiGian;
        this.tongDoanhThu = tongDoanhThu;
        this.doanhThuOnline = doanhThuOnline;
        this.doanhThuOffline = doanhThuOffline;
        this.onlineHoanThanh = onlineHoanThanh;
        this.onlineHuy = onlineHuy;
        this.offlineHoanThanh = offlineHoanThanh;
        this.offlineHuy = offlineHuy;
        this.soLuongDon = soLuongDon;
        this.tiLeTangTruongDoanhThu = tiLeTangTruongDoanhThu;
    }

    // Getters and setters
    public String getThoiGian() { return thoiGian; }
    public void setThoiGian(String thoiGian) { this.thoiGian = thoiGian; }
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
    public Double getTiLeTangTruongDoanhThu() { return tiLeTangTruongDoanhThu; }
    public void setTiLeTangTruongDoanhThu(Double tiLeTangTruongDoanhThu) { this.tiLeTangTruongDoanhThu = tiLeTangTruongDoanhThu; }
}
