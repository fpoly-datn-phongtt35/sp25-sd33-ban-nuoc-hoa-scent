package com.example.scent.entity.ThongKe;

public class SoLuongDonHangDTO {
    private String thoiGian; // Ngày, tuần (năm-tuần), tháng (yyyy-MM), hoặc năm
    private long soLuongDon;

    public SoLuongDonHangDTO(String thoiGian, long soLuongDon) {
        this.thoiGian = thoiGian;
        this.soLuongDon = soLuongDon;
    }

    // Getters and setters
    public String getThoiGian() { return thoiGian; }
    public void setThoiGian(String thoiGian) { this.thoiGian = thoiGian; }
    public long getSoLuongDon() { return soLuongDon; }
    public void setSoLuongDon(long soLuongDon) { this.soLuongDon = soLuongDon; }
}
