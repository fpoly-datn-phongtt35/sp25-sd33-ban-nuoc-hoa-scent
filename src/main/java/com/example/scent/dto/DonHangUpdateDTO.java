package com.example.scent.dto;

public class DonHangUpdateDTO {
    private Integer idDonHang;
    private Integer trangThai;
    private boolean isNewOrder;

    public boolean isNewOrder() {
        return isNewOrder;
    }

    public void setIsNewOrder(boolean isNewOrder) {
        this.isNewOrder = isNewOrder;
    }
    public DonHangUpdateDTO() {
    }

    public DonHangUpdateDTO(Integer idDonHang, Integer trangThai) {
        this.idDonHang = idDonHang;
        this.trangThai = trangThai;
        this.isNewOrder = false;
    }

    public Integer getIdDonHang() {
        return idDonHang;
    }

    public void setIdDonHang(Integer idDonHang) {
        this.idDonHang = idDonHang;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    @Override
    public String toString() {
        return "DonHangUpdateDTO{" +
                "idDonHang=" + idDonHang +
                ", trangThai=" + trangThai +
                '}';
    }
}
