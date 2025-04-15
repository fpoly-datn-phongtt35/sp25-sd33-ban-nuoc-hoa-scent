package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "nong_do")

public class NongDo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_nong_do", nullable = false, length = 50)
    private String tenNongDo;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "ty_le_tinh_dau", precision = 4, scale = 2)
    private BigDecimal tyLeTinhDau;
    @JsonIgnore
    @OneToMany(mappedBy = "nongDo")
    List<SanPham> sanPhams;
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTenNongDo() {
        return tenNongDo;
    }

    public void setTenNongDo(String tenNongDo) {
        this.tenNongDo = tenNongDo;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public BigDecimal getTyLeTinhDau() {
        return tyLeTinhDau;
    }

    public void setTyLeTinhDau(BigDecimal tyLeTinhDau) {
        this.tyLeTinhDau = tyLeTinhDau;
    }

    public NongDo() {
    }

    public NongDo(Integer id, String tenNongDo, String moTa, BigDecimal tyLeTinhDau) {
        this.id = id;
        this.tenNongDo = tenNongDo;
        this.moTa = moTa;
        this.tyLeTinhDau = tyLeTinhDau;
    }
}
