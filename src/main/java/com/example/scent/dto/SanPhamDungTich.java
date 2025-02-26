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
public class SanPhamDungTich {
    private Integer IdSanPham;
    private Integer dungTich ;
    private BigDecimal DonGia;
}
