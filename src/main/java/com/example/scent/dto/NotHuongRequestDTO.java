package com.example.scent.dto;

import com.example.scent.entity.MuiHuong;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

public class NotHuongRequestDTO {

    private Integer id;

    private String tenNotHuong;

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

    public Integer getIdmuiHuong() {
        return IdmuiHuong;
    }

    public void setIdmuiHuong(Integer idmuiHuong) {
        IdmuiHuong = idmuiHuong;
    }

    private String moTa;

    private Integer IdmuiHuong;

}
