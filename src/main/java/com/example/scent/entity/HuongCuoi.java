package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "huong_cuoi")
@Entity
public class HuongCuoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mota")
    private String moTaHuongCuoi;
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "huong_cuoi_not_huong",
            joinColumns = @JoinColumn(name = "id_huong_cuoi"),
            inverseJoinColumns = @JoinColumn(name = "id_not_huong")
    )
    private List<NotHuong> notHuongs;

    // Getters và setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMoTaHuongCuoi() {
        return moTaHuongCuoi;
    }

    public void setMoTaHuongCuoi(String moTaHuongCuoi) {
        this.moTaHuongCuoi = moTaHuongCuoi;
    }

    public List<NotHuong> getNotHuongs() {
        return notHuongs;
    }

    public void setNotHuongs(List<NotHuong> notHuongs) {
        this.notHuongs = notHuongs;
    }
}