package com.example.scent.entity;


import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "tinh")
@Entity

public class tinh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_tinh")
    private Integer maTinh;

    @Column(name = "ten_tinh")
    private String tenTinh;
    @Version
    @Column(name = "version")
    private Long version = 0L;

    public Integer getMaTinh() {
        return maTinh;
    }

    public void setMaTinh(Integer maTinh) {
        this.maTinh = maTinh;
    }

    public String getTenTinh() {
        return tenTinh;
    }

    public void setTenTinh(String tenTinh) {
        this.tenTinh = tenTinh;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
