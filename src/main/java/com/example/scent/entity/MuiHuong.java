package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "mui_huong")
public class MuiHuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ten_mui_huong")
    private String tenMuiHuong;

    @Column(name = "mo_ta")
    private String moTa;
    @JsonIgnore
    @OneToMany(mappedBy = "muiHuong")
    private List<NotHuong> notHuongs;
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "mui_huong_nhom_huong",
            joinColumns = @JoinColumn(name = "id_mui_huong"),
            inverseJoinColumns = @JoinColumn(name = "id_nhom_huong")
    )
    private List<NhomHuong> nhomHuongOnMuiHuongs;
    @JsonIgnore
    @OneToMany(mappedBy = "muiHuong")
    private List<SanPhamMuiHuong> sanPhamMuiHuongs;
    // Getters và setters
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

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public List<NotHuong> getNotHuongs() {
        return notHuongs;
    }

    public void setNotHuongs(List<NotHuong> notHuongs) {
        this.notHuongs = notHuongs;
    }

    public MuiHuong(Integer id, String tenMuiHuong, String moTa, List<NotHuong> notHuongs, List<NhomHuong> nhomHuongOnMuiHuongs) {
        this.id = id;
        this.tenMuiHuong = tenMuiHuong;
        this.moTa = moTa;
        this.notHuongs = notHuongs;
        this.nhomHuongOnMuiHuongs = nhomHuongOnMuiHuongs;
    }
}