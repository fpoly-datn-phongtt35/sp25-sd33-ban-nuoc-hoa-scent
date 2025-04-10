package com.example.scent.reques;



public class InventoryUpdateMessage {
    private Integer productId;
    private Integer stock;

    public InventoryUpdateMessage(Integer productId, Integer stock) {
        this.productId = productId;
        this.stock = stock;
    }

    // Getters và setters
    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}
