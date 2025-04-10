package com.example.scent.entity;



import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ChiTietGioHang")
public class ChiTietGioHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_gio_hang")
    private GioHang gioHang;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_spct")
    private Spct spct;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia", precision = 19, scale = 4)
    private BigDecimal donGia;
}