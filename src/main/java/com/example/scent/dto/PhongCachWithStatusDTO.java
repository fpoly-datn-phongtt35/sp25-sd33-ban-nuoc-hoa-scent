package com.example.scent.dto;

import lombok.Data;

@Data
public class PhongCachWithStatusDTO {
    private Integer id;
    private String tenPhongCach;
    private String moTa;
    private boolean hasProduct;

    public PhongCachWithStatusDTO(Integer id, String tenPhongCach, String moTa, boolean hasProduct) {
        this.id = id;
        this.tenPhongCach = tenPhongCach;
        this.moTa = moTa;
        this.hasProduct = hasProduct;
    }

    public PhongCachWithStatusDTO() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenPhongCach() {
        return tenPhongCach;
    }

    public void setTenPhongCach(String tenPhongCach) {
        this.tenPhongCach = tenPhongCach;
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