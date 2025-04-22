package com.example.scent.dto;

import lombok.Data;

@Data
public class NhomHuongWithStatusDTO {
    private Integer id;
    private String tenNhomHuong;
    private String mota;
    private Integer hasProduct;

    public NhomHuongWithStatusDTO(Integer id, String tenNhomHuong, String mota, Integer hasProduct) {
        this.id = id;
        this.tenNhomHuong = tenNhomHuong;
        this.mota = mota;
        this.hasProduct = hasProduct;
    }

    public NhomHuongWithStatusDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public String getMota() {
        return mota;
    }

    public void setMota(String mota) {
        this.mota = mota;
    }

    public Integer getHasProduct() {
        return hasProduct;
    }

    public void setHasProduct(Integer hasProduct) {
        this.hasProduct = hasProduct;
    }
}