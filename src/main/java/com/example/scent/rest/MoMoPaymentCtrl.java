package com.example.scent.rest;

import com.example.scent.reques.CheckStatusMoMoRequest;
import com.example.scent.reques.MomoRequest;
import com.example.scent.service.MoMoPaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/rest/momo")
@Slf4j
@RequiredArgsConstructor
public class MoMoPaymentCtrl {

    private static final Logger log = LoggerFactory.getLogger(MoMoPaymentCtrl.class);

    //private final MoMoPaymentService moMoPaymentService;
    @Autowired
    private MoMoPaymentService moMoPaymentService;
    //private final ObjectMapper objectMapper;
    @Autowired
    private ObjectMapper objectMapper;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @PostMapping("/pay")
    public ResponseEntity<?> createPayment(@Validated @RequestBody MomoRequest dto) {
        return ResponseEntity.ok(moMoPaymentService.createPayment(dto));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestBody String callbackBody) {
        log.info("[MoMo Callback] Body: {}", callbackBody);
        try {
            // Parse callback body
            Map<String, Object> callbackData = objectMapper.readValue(callbackBody, Map.class);
            String receivedSignature = (String) callbackData.get("signature");

            // Create raw data for signature verification
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                    accessKey,
                    callbackData.get("amount"),
                    callbackData.get("message"),
                    callbackData.get("orderId"),
                    callbackData.get("orderInfo"),
                    callbackData.get("orderType"),
                    callbackData.get("partnerCode"),
                    callbackData.get("payType"),
                    callbackData.get("requestId"),
                    callbackData.get("responseTime"),
                    callbackData.get("resultCode"),
                    callbackData.get("transId")
            );

            // Generate HMAC SHA256 signature
            String computedSignature = hmacSHA256(rawSignature, secretKey);

            // Verify signature
            if (!computedSignature.equals(receivedSignature)) {
                log.error("Invalid MoMo callback signature");
                return ResponseEntity.badRequest().build();
            }

            // Process the callback
            int resultCode = (int) callbackData.get("resultCode");
            String orderId = (String) callbackData.get("orderId");
            if (resultCode == 0) {
                log.info("Payment successful for orderId: {}", orderId);
                // TODO: Update order status in your database
            } else {
                log.warn("Payment failed for orderId: {}. Result code: {}", orderId, resultCode);
                // TODO: Handle payment failure
            }

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error processing MoMo callback: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/check-status")
    public ResponseEntity<?> checkTransaction(@Validated @RequestBody CheckStatusMoMoRequest request) {
        return ResponseEntity.ok(moMoPaymentService.checkTransactionStatus(request.getOrderId()));
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}