package com.example.scent.reques;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoRequest {

    @NotBlank(message = "orderId không được để trống")
    private String orderId;

    @NotBlank(message = "orderInfo không được để trống")
    private String orderInfo;

    @NotBlank(message = "amount không được để trống")
    @Pattern(regexp = "^[0-9]+$", message = "amount phải là số")
    private String amount;

    @NotBlank(message = "returnUrl không được để trống")
    private String returnUrl;

    @NotBlank(message = "notifyUrl không được để trống")
    private String notifyUrl;

    @NotBlank(message = "requestType không được để trống")
    private String requestType;

    // extraData can be optional
    private String extraData;

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getNotifyUrl() {
        return notifyUrl;
    }

    public void setNotifyUrl(String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getExtraData() {
        return extraData;
    }

    public void setExtraData(String extraData) {
        this.extraData = extraData;
    }
}