package com.example.scent.reques;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Builder
public class MomoRequest {
    @NotBlank(message = "orderId không được để trống")
    private String orderId;

    @NotBlank(message = "requestId không được để trống")
    private String requestId;

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

    // extraData có thể để trống nếu không cần truyền thêm dữ liệu
    private String extraData;

    public MomoRequest() {
    }

    public MomoRequest(String orderId, String requestId, String orderInfo, String amount, String returnUrl, String notifyUrl, String requestType, String extraData) {
        this.orderId = orderId;
        this.requestId = requestId;
        this.orderInfo = orderInfo;
        this.amount = amount;
        this.returnUrl = returnUrl;
        this.notifyUrl = notifyUrl;
        this.requestType = requestType;
        this.extraData = extraData;
    }

    public @NotBlank(message = "orderId không được để trống") String getOrderId() {
        return orderId;
    }

    public void setOrderId(@NotBlank(message = "orderId không được để trống") String orderId) {
        this.orderId = orderId;
    }

    public @NotBlank(message = "requestId không được để trống") String getRequestId() {
        return requestId;
    }

    public void setRequestId(@NotBlank(message = "requestId không được để trống") String requestId) {
        this.requestId = requestId;
    }

    public @NotBlank(message = "orderInfo không được để trống") String getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(@NotBlank(message = "orderInfo không được để trống") String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public @NotBlank(message = "amount không được để trống") @Pattern(regexp = "^[0-9]+$", message = "amount phải là số") String getAmount() {
        return amount;
    }

    public void setAmount(@NotBlank(message = "amount không được để trống") @Pattern(regexp = "^[0-9]+$", message = "amount phải là số") String amount) {
        this.amount = amount;
    }

    public @NotBlank(message = "returnUrl không được để trống") String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(@NotBlank(message = "returnUrl không được để trống") String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public @NotBlank(message = "notifyUrl không được để trống") String getNotifyUrl() {
        return notifyUrl;
    }

    public void setNotifyUrl(@NotBlank(message = "notifyUrl không được để trống") String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }

    public @NotBlank(message = "requestType không được để trống") String getRequestType() {
        return requestType;
    }

    public void setRequestType(@NotBlank(message = "requestType không được để trống") String requestType) {
        this.requestType = requestType;
    }

    public String getExtraData() {
        return extraData;
    }

    public void setExtraData(String extraData) {
        this.extraData = extraData;
    }
}
