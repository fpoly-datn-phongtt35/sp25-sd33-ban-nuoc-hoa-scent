package com.example.scent.reques;


import com.example.scent.dto.OrderIOfflinetemDto;
import com.example.scent.dto.OrderItemDto;
import com.example.scent.entity.ChiTietDonHang;
import com.example.scent.entity.DonHang;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OrderOfflineRequest {

    private Integer userId ; // ID of the staff account creating the order
    private String tenNguoiNhanHang; // Customer name (optional)
    private String sdtNguoiNhan; // Customer phone number (optional)
    private List<OrderIOfflinetemDto> chiTietDonHangs; // List of order items
    private String maGiamGia; // Discount code (optional)
    private String phuongThucThanhToan; // Payment method (e.g., "Tiền mặt")
    private String ghiChu; // Optional note

    // Getters and Setters


    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getTenNguoiNhanHang() {
        return tenNguoiNhanHang;
    }

    public void setTenNguoiNhanHang(String tenNguoiNhanHang) {
        this.tenNguoiNhanHang = tenNguoiNhanHang;
    }

    public String getSdtNguoiNhan() {
        return sdtNguoiNhan;
    }

    public void setSdtNguoiNhan(String sdtNguoiNhan) {
        this.sdtNguoiNhan = sdtNguoiNhan;
    }

    public List<OrderIOfflinetemDto> getChiTietDonHangs() {
        return chiTietDonHangs;
    }

    public void setChiTietDonHangs(List<OrderIOfflinetemDto> chiTietDonHangs) {
        this.chiTietDonHangs = chiTietDonHangs;
    }

    public String getMaGiamGia() {
        return maGiamGia;
    }

    public void setMaGiamGia(String maGiamGia) {
        this.maGiamGia = maGiamGia;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}