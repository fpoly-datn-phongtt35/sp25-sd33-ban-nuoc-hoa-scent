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
}