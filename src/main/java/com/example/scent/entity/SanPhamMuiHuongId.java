package com.example.scent.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class SanPhamMuiHuongId implements Serializable {
    @Column(name = "id_san_pham")
    private Integer idSanPham;

    @Column(name = "id_mui_huong")
    private Integer idMuiHuong;
}
