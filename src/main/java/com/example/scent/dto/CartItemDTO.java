package com.example.scent.dto;



import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CartItemDTO {
    private Integer id;
    private Integer soLuong;
    private BigDecimal donGia;
    private Integer idSpct;
    private Integer dungTich;
    private String tenSanPham;
    private List<String> imageUrl;
    private Integer soLuongTonKho;
}
