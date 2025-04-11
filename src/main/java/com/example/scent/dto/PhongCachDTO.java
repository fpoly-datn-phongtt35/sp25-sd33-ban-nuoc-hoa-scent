package com.example.scent.dto;

public class PhongCachDTO {
    private Integer id;
    private String tenPhongCach;
    private String moTa;

    public PhongCachDTO() {
    }

    public PhongCachDTO(Integer id, String tenPhongCach, String moTa) {
        this.id = id;
        this.tenPhongCach = tenPhongCach;
        this.moTa = moTa;
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
}