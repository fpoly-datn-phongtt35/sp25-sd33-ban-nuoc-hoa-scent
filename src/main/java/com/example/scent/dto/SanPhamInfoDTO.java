package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamInfoDTO {
    private Integer IdSanPham;
    private String TenSanPham;
    private BigDecimal DonGia;
    private String imageURL;
}
