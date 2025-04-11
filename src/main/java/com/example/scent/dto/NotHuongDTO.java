package com.example.scent.dto;



public class NotHuongDTO {
    private Integer id;
    private String tenNotHuong;
    private String moTa;

    public NotHuongDTO() {
    }

    public NotHuongDTO(Integer id, String tenNotHuong, String moTa) {
        this.id = id;
        this.tenNotHuong = tenNotHuong;
        this.moTa = moTa;
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
}