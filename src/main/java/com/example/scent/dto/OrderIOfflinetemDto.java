package com.example.scent.dto;

public class OrderIOfflinetemDto {
    private Integer spctId; // ID of the product variant (spct table)
    private Integer quantity; // Quantity

    // Getters and Setters
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
}