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
}