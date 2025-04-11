package com.example.scent.dto;

import java.util.List;

public class TangHuongDTO {
    private Integer id;
    private String tenHuong;
    private List<NotHuongUpdateReponseDTO> notHuongs;

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTenHuong() { return tenHuong; }
    public void setTenHuong(String tenHuong) { this.tenHuong = tenHuong; }
    public List<NotHuongUpdateReponseDTO> getNotHuongs() { return notHuongs; }
    public void setNotHuongs(List<NotHuongUpdateReponseDTO> notHuongs) { this.notHuongs = notHuongs; }
}
