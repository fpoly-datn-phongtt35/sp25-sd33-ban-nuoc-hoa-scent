package com.example.scent.entity;

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

    @ManyToOne
    @JoinColumn(name = "id_mui_huong")
    private MuiHuong muiHuong;
}