package com.example.scent.reques;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
