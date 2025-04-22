package com.example.scent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "san_pham_mui_huong")
public class SanPhamMuiHuong implements Serializable {

    @EmbeddedId
    private SanPhamMuiHuongId id;

    @ManyToOne
    @MapsId("idSanPham")
    @JoinColumn(name = "id_san_pham")
    private SanPham sanPham;

    @ManyToOne
    @MapsId("idMuiHuong")
    @JoinColumn(name = "id_mui_huong")
    private MuiHuong muiHuong;

    @Column(name = "prominence")
    private Double prominence;

    public SanPhamMuiHuongId getId() {
        return id;
    }

    public void setId(SanPhamMuiHuongId id) {
        this.id = id;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public MuiHuong getMuiHuong() {
        return muiHuong;
    }

    public void setMuiHuong(MuiHuong muiHuong) {
        this.muiHuong = muiHuong;
    }

    public Double getProminence() {
        return prominence;
    }

    public void setProminence(Double prominence) {
        this.prominence = prominence;
    }
}