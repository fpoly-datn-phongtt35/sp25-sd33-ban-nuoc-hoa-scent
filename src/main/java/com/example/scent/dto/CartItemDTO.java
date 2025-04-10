package com.example.scent.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Integer id;
    private Integer soLuong;
    private BigDecimal donGia;
    private Integer idSpct;
    private Integer dungTich;
    private String tenSanPham;
    private List<String> imageUrl;
}
