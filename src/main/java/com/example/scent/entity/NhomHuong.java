package com.example.scent.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

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

}
