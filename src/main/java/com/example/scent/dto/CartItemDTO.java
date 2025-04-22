package com.example.scent.dto;



import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonSerialize
@Getter
@Setter
public class CartItemDTO {
    private Integer id;
    private Integer soLuong;
    private BigDecimal donGia;
    private Integer idSpct;
    private Integer dungTich;
    private String tenSanPham;
    private List<String> imageUrl;
    private Integer soLuongTonKho;

    public CartItemDTO() {
    }

    public CartItemDTO(Integer id, Integer soLuong, BigDecimal donGia, Integer idSpct, Integer dungTich, String tenSanPham, List<String> imageUrl, Integer soLuongTonKho) {
        this.id = id;
        this.soLuong = soLuong;
        this.donGia = donGia;
        this.idSpct = idSpct;
        this.dungTich = dungTich;
        this.tenSanPham = tenSanPham;
        this.imageUrl = imageUrl;
        this.soLuongTonKho = soLuongTonKho;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public Integer getIdSpct() {
        return idSpct;
    }

    public void setIdSpct(Integer idSpct) {
        this.idSpct = idSpct;
    }

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public List<String> getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(List<String> imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getSoLuongTonKho() {
        return soLuongTonKho;
    }

    public void setSoLuongTonKho(Integer soLuongTonKho) {
        this.soLuongTonKho = soLuongTonKho;
    }
}
