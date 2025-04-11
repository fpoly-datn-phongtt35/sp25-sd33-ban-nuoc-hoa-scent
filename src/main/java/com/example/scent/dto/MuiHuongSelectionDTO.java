package com.example.scent.dto;

public class MuiHuongSelectionDTO {
    private Integer id;
    private String tenMuiHuong;
    private Double prominenceLevel;

    public MuiHuongSelectionDTO() {
    }

    public MuiHuongSelectionDTO(Integer id, String tenMuiHuong, Double prominenceLevel) {
        this.id = id;
        this.tenMuiHuong = tenMuiHuong;
        this.prominenceLevel = prominenceLevel;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenMuiHuong() {
        return tenMuiHuong;
    }

    public void setTenMuiHuong(String tenMuiHuong) {
        this.tenMuiHuong = tenMuiHuong;
    }

    public Double getProminenceLevel() {
        return prominenceLevel;
    }

    public void setProminenceLevel(Double prominenceLevel) {
        this.prominenceLevel = prominenceLevel;
    }
}