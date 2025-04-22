package com.example.scent.dto;

import lombok.Data;

@Data
public class MuiHuongWithStatusDTO {
    private Integer id;
    private String tenMuiHuong;
    private String moTa;
    private boolean hasProduct;

    public MuiHuongWithStatusDTO(Integer id, String tenMuiHuong, String moTa, boolean hasProduct) {
        this.id = id;
        this.tenMuiHuong = tenMuiHuong;
        this.moTa = moTa;
        this.hasProduct = hasProduct;
    }

    public MuiHuongWithStatusDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenMuiHuong() {
        return tenMuiHuong;
    }

    public void setTenMuiHuong(String tenMuiHuong) {
        this.tenMuiHuong = tenMuiHuong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public boolean isHasProduct() {
        return hasProduct;
    }

    public void setHasProduct(boolean hasProduct) {
        this.hasProduct = hasProduct;
    }
}