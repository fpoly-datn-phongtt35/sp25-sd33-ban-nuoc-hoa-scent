package com.example.scent.websocket;
public class YeuCauTraHangUpdateDTO {
    private Integer id;
    private Integer trangThai;
    private String lyDoTuChoi;
    private Integer idTaiKhoan; // Thêm idTaiKhoan

    public YeuCauTraHangUpdateDTO(Integer id, Integer trangThai, Integer idTaiKhoan) {
        this.id = id;
        this.trangThai = trangThai;
        this.idTaiKhoan = idTaiKhoan;
    }

    // Getters và setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public String getLyDoTuChoi() {
        return lyDoTuChoi;
    }

    public void setLyDoTuChoi(String lyDoTuChoi) {
        this.lyDoTuChoi = lyDoTuChoi;
    }

    public Integer getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Integer idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }
}
