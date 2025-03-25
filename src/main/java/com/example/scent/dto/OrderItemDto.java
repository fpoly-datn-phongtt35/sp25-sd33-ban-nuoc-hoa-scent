package com.example.scent.dto;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


public class OrderItemDto {
    private Integer spctId;  // ID của sản phẩm cụ thể
    private Integer quantity;  // Số lượng đặt mua
    private List<String> imageURL;

    @Override
    public String toString() {
        return "OrderItemDto{" +
                "spctId=" + spctId +
                ", quantity=" + quantity +
                ", imageURL=" + imageURL +
                '}';
    }

    public Integer getSpctId() {
        return spctId;
    }

    public void setSpctId(Integer spctId) {
        this.spctId = spctId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<String> getImageURL() {
        return imageURL;
    }

    public void setImageURL(List<String> imageURL) {
        this.imageURL = imageURL;
    }

    public OrderItemDto(Integer spctId, List<String> imageURL, Integer quantity) {
        this.spctId = spctId;
        this.imageURL = imageURL;
        this.quantity = quantity;
    }

    public OrderItemDto() {
    }
}

