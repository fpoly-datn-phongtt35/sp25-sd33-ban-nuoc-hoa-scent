package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "mui_huong")
public class MuiHuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ten_mui_huong", length = 100)
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
    private List<NhomHuong> nhomHuongs;

    @JsonIgnore
    @OneToMany(mappedBy = "muiHuong")
    private List<SanPhamMuiHuong> sanPhamMuiHuongs;

    public MuiHuong(Integer id, String tenMuiHuong, String moTa, List<NotHuong> notHuongs, List<NhomHuong> nhomHuongs, List<SanPhamMuiHuong> sanPhamMuiHuongs) {
        this.id = id;
        this.tenMuiHuong = tenMuiHuong;
        this.moTa = moTa;
        this.notHuongs = notHuongs;
        this.nhomHuongs = nhomHuongs;
        this.sanPhamMuiHuongs = sanPhamMuiHuongs;
    }

    public MuiHuong() {
    }
}