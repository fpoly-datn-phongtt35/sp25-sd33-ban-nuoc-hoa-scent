package com.example.scent.reques;

import jakarta.validation.constraints.NotBlank;

public class CheckStatusMoMoRequest {
    @NotBlank(message = "orderId không được để trống")
    private String orderId;

    public CheckStatusMoMoRequest() {
    }

    public CheckStatusMoMoRequest(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
}
