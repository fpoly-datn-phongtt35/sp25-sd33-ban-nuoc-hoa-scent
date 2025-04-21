package com.example.scent.dto;

import lombok.Data;

@Data
public class ThuongHieuWithStatusDTO {
    private Integer id;
    private String tenThuongHieu;
    private String quocGia; // Thêm quốc gia
    private String moTa;
    private boolean hasProduct;

    public ThuongHieuWithStatusDTO(Integer id, String tenThuongHieu, String quocGia, String moTa, boolean hasProduct) {
        this.id = id;
        this.tenThuongHieu = tenThuongHieu;
        this.quocGia = quocGia;
        this.moTa = moTa;
        this.hasProduct = hasProduct;
    }
}