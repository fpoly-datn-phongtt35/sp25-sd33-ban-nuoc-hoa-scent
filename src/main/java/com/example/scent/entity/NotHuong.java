package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "not_huong")
@Data
public class NotHuong {
    @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

    @Column(name = "ten_not_huong")
    private String tenNotHuong;

    @Column(name = "mo_ta")
    private String moTa;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_mui_huong")
    private MuiHuong muiHuong;

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

    public MuiHuong getMuiHuong() {
        return muiHuong;
    }

    public void setMuiHuong(MuiHuong muiHuong) {
        this.muiHuong = muiHuong;
    }

    public NotHuong(Integer id, String tenNotHuong, String moTa, MuiHuong muiHuong) {
        this.id = id;
        this.tenNotHuong = tenNotHuong;
        this.moTa = moTa;
        this.muiHuong = muiHuong;
    }

    public NotHuong() {
    }
}