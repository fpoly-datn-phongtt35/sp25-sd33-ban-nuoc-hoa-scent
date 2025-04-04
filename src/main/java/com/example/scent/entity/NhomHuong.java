package com.example.scent.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Table(name = "nhom_huong")
@Entity
public class NhomHuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    @Column(name = "ten_nhom")
    private String tenNhomHuong;
    @Column(name = "mo_ta")
    private String mota;
    @JsonIgnore
    @OneToMany(mappedBy = "nhomHuong")
    private List<SanPham> sanPhams;

    public NhomHuong() {
    }

    public NhomHuong(Integer id, String tenNhomHuong, String mota, List<SanPham> sanPhams) {
        this.id = id;
        this.tenNhomHuong = tenNhomHuong;
        this.mota = mota;
        this.sanPhams = sanPhams;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public String getMota() {
        return mota;
    }

    public void setMota(String mota) {
        this.mota = mota;
    }

    public List<SanPham> getSanPhams() {
        return sanPhams;
    }

    public void setSanPhams(List<SanPham> sanPhams) {
        this.sanPhams = sanPhams;
    }
}
