package com.example.scent.reques;

public class UpdateOrderStatusRequest {
    private Integer trangThai;
    private String lyDoHuy;

    // Getters and Setters
    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public String getLyDoHuy() {
        return lyDoHuy;
    }

    public void setLyDoHuy(String lyDoHuy) {
        this.lyDoHuy = lyDoHuy;
    }
}
