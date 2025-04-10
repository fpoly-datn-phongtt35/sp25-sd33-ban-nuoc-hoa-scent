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
@Table(name = "huong_giua")
@Entity
public class HuongGiua {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mota")
    @JsonProperty("moTaHuongGiua")
    private String moTaHuongGiua;
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "huong_giua_not_huong",
            joinColumns = @JoinColumn(name = "id_huong_giua"),
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

    public String getMoTaHuongGiua() {
        return moTaHuongGiua;
    }

    public void setMoTaHuongGiua(String moTaHuongGiua) {
        this.moTaHuongGiua = moTaHuongGiua;
    }

    public List<NotHuong> getNotHuongs() {
        return notHuongs;
    }

    public void setNotHuongs(List<NotHuong> notHuongs) {
        this.notHuongs = notHuongs;
    }
}