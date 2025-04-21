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
}