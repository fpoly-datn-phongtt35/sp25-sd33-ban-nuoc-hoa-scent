package com.example.scent.dto;

import lombok.Data;

@Data
public class NotHuongWithStatusDTO {
    private Integer id;
    private String tenNotHuong;
    private String moTa;
    private Integer muiHuongId;
    private String tenMuiHuong;
    private boolean hasProduct;

    public NotHuongWithStatusDTO(Integer id, String tenNotHuong, String moTa, Integer muiHuongId, String tenMuiHuong, boolean hasProduct) {
        this.id = id;
        this.tenNotHuong = tenNotHuong;
        this.moTa = moTa;
        this.muiHuongId = muiHuongId;
        this.tenMuiHuong = tenMuiHuong;
        this.hasProduct = hasProduct;
    }

    public NotHuongWithStatusDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenNotHuong() {
        return tenNotHuong;
    }

    public void setTenNotHuong(String tenNotHuong) {
        this.tenNotHuong = tenNotHuong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Integer getMuiHuongId() {
        return muiHuongId;
    }

    public void setMuiHuongId(Integer muiHuongId) {
        this.muiHuongId = muiHuongId;
    }

    public String getTenMuiHuong() {
        return tenMuiHuong;
    }

    public void setTenMuiHuong(String tenMuiHuong) {
        this.tenMuiHuong = tenMuiHuong;
    }

    public boolean isHasProduct() {
        return hasProduct;
    }

    public void setHasProduct(boolean hasProduct) {
        this.hasProduct = hasProduct;
    }
}