package com.example.scent.service;

import com.example.scent.reques.MomoRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class MoMoPaymentService {
    private static final Logger log = LoggerFactory.getLogger(MoMoPaymentService.class);

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    //private final ObjectMapper objectMapper;
    @Autowired
    private ObjectMapper objectMapper;

    public Map<String, Object> createPayment(MomoRequest dto) {
        try {
            // Generate a unique orderId if not provided
            String orderId = dto.getOrderId();
            if (orderId == null || orderId.isEmpty()) {
                orderId = partnerCode + System.currentTimeMillis();
            }

            // Generate a unique requestId
            String requestId = UUID.randomUUID().toString();

            // Ensure extraData is not null
            String extraData = dto.getExtraData() != null ? dto.getExtraData() : "";

            // Parse amount to long
            long amount = Long.parseLong(dto.getAmount());

            // Create raw signature string
            String rawSignature = String.format(
                    "accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey, amount, extraData, dto.getNotifyUrl(), orderId, dto.getOrderInfo(),
                    partnerCode, dto.getReturnUrl(), requestId, dto.getRequestType()
            );

            // Generate HMAC SHA256 signature
            String signature = hmacSHA256(rawSignature, secretKey);

            // Create request body
            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("partnerName", "Test");
            body.put("storeId", "MomoTestStore");
            body.put("requestId", requestId);
            body.put("amount", amount);
            body.put("orderId", orderId);
            body.put("orderInfo", dto.getOrderInfo());
            body.put("redirectUrl", dto.getReturnUrl());
            body.put("ipnUrl", dto.getNotifyUrl());
            body.put("lang", "vi");
            body.put("requestType", dto.getRequestType());
            body.put("autoCapture", true);
            body.put("expireTime", String.valueOf(System.currentTimeMillis() + 5 * 60 * 1000)); // 15 minutes expiry
            body.put("extraData", extraData);
            body.put("orderGroupId", "");
            body.put("signature", signature);

            // Send request to MoMo
            HttpClient client = HttpClientBuilder.create().build();
            HttpPost post = new HttpPost(endpoint);
            post.setHeader("Content-Type", "application/json");
            post.setEntity(new StringEntity(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);
            String json = EntityUtils.toString(response.getEntity());

            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("[MoMo] Payment creation failed", e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return error;
        }
    }

    public Map<String, Object> checkTransactionStatus(String orderId) {
        try {
            // Generate a unique requestId
            String requestId = UUID.randomUUID().toString();

            // Create raw signature string
            String rawSignature = String.format(
                    "accessKey=%s&orderId=%s&partnerCode=%s&requestId=%s",
                    accessKey, orderId, partnerCode, requestId
            );

            // Generate HMAC SHA256 signature
            String signature = hmacSHA256(rawSignature, secretKey);

            // Create request body
            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("requestId", requestId);
            body.put("orderId", orderId);
            body.put("signature", signature);
            body.put("lang", "vi");

            // Log request body for debugging
            log.info("Request to MoMo /query: {}", objectMapper.writeValueAsString(body));

            // Send request to MoMo
            HttpClient client = HttpClientBuilder.create().build();
            String queryEndpoint = endpoint.replace("/create", "/query");
            HttpPost post = new HttpPost(queryEndpoint);
            post.setHeader("Content-Type", "application/json");
            post.setEntity(new StringEntity(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);
            String json = EntityUtils.toString(response.getEntity());

            // Log response for debugging
            log.info("Response from MoMo /query: {}", json);

            return objectMapper.readValue(json, Map.class);

        } catch (Exception e) {
            log.error("[MoMo] Transaction status check failed for orderId: {}", orderId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to check transaction status: " + e.getMessage());
            return error;
        }
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