package com.example.scent.dto;

public class MuiHuongDtoImpl implements MuiHuongDto {
    private String tenMuiHuong;
    private Float prominence;

    // Constructor mặc định (bắt buộc cho Jackson)
    public MuiHuongDtoImpl() {
    }

    // Constructor có tham số (tùy chọn, để tiện sử dụng)
    public MuiHuongDtoImpl(String tenMuiHuong, Float prominence) {
        this.tenMuiHuong = tenMuiHuong;
        this.prominence = prominence;
    }

    @Override
    public String getTenMuiHuong() {
        return tenMuiHuong;
    }

    public void setTenMuiHuong(String tenMuiHuong) {
        this.tenMuiHuong = tenMuiHuong;
    }

    @Override
    public Float getProminence() {
        return prominence;
    }

    public void setProminence(Float prominence) {
        this.prominence = prominence;
    }
}