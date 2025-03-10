package com.example.scent.dto;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private Integer spctId;  // ID của sản phẩm cụ thể
    private Integer quantity;  // Số lượng đặt mua
    private List<String> imageURL;
}

