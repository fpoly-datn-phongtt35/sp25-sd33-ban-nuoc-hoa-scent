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
}