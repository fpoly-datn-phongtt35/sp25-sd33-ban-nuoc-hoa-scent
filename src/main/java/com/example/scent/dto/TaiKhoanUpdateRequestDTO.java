package com.example.scent.dto;

public class TaiKhoanUpdateRequestDTO {
    private Integer id;
    private String hoTen;
    private String email;
    private String sdt;

    public TaiKhoanUpdateRequestDTO(Integer id) {
        this.id = id;
    }

    public TaiKhoanUpdateRequestDTO(Integer id, String hoTen, String email, String sdt) {
        this.id = id;
        this.hoTen = hoTen;
        this.email = email;
        this.sdt = sdt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }
}
