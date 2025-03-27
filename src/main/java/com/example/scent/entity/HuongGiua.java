package com.example.scent.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;
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
    @JsonProperty("moTaHuongGiua") // Bắt buộc thêm dòng này
    private String moTaHuongGiua;


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



}