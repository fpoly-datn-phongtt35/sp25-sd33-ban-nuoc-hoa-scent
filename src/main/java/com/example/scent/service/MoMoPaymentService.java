package com.example.scent.service;

import com.example.scent.reques.MomoRequest;
import com.example.scent.rest.MoMoPaymentCtrl;
import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
//@Slf4j
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

    public Map<String, Object> createPayment(MomoRequest dto) {
        try {
            String orderId = dto.getOrderId();
            if (orderId == null || orderId.isEmpty()) {
                orderId = partnerCode + System.currentTimeMillis(); // fallback nếu không có
            }
            String requestId = orderId;


            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + dto.getAmount() +
                    "&extraData=" + dto.getExtraData() +
                    "&ipnUrl=" + dto.getNotifyUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + dto.getOrderInfo() +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + dto.getReturnUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + dto.getRequestType();

            String signature = hmacSHA256(rawSignature, secretKey);

            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("partnerName", "Test");
            body.put("storeId", "MomoTestStore");
            body.put("requestId", requestId);
            body.put("amount", dto.getAmount());
            body.put("orderId", orderId);
            body.put("orderInfo", dto.getOrderInfo());
            body.put("redirectUrl", dto.getReturnUrl());
            body.put("ipnUrl", dto.getNotifyUrl());
            body.put("lang", "vi");
            body.put("requestType", dto.getRequestType());
            body.put("autoCapture", true);
            body.put("expireTime", String.valueOf(System.currentTimeMillis() + 15 * 60 * 1000));
            body.put("extraData", dto.getExtraData());
            body.put("orderGroupId", "");
            body.put("signature", signature);

            HttpClient client = HttpClientBuilder.create().build();
            HttpPost post = new HttpPost(endpoint);
            post.setHeader("Content-Type", "application/json");
            post.setEntity(new StringEntity(new ObjectMapper().writeValueAsString(body), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);
            String json = EntityUtils.toString(response.getEntity());

            return new ObjectMapper().readValue(json, Map.class);
        } catch (Exception e) {
            log.error("[MoMo] Payment creation failed", e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return error;
        }
    }

    public Map<String, Object> checkTransactionStatus(String orderId) {
        try {
            String requestId = orderId;

            String rawSignature = "accessKey=" + accessKey +
                    "&orderId=" + orderId +
                    "&partnerCode=" + partnerCode +
                    "&requestId=" + requestId;

            String signature = hmacSHA256(rawSignature, secretKey);

            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("requestId", requestId);
            body.put("orderId", orderId);
            body.put("signature", signature);
            body.put("lang", "vi");

            HttpClient client = HttpClientBuilder.create().build();
            HttpPost post = new HttpPost("https://test-payment.momo.vn/v2/gateway/api/query");
            post.setHeader("Content-Type", "application/json");
            post.setEntity(new StringEntity(new ObjectMapper().writeValueAsString(body), StandardCharsets.UTF_8));

            HttpResponse response = client.execute(post);
            String json = EntityUtils.toString(response.getEntity());
            return new ObjectMapper().readValue(json, Map.class);

        } catch (Exception e) {
            log.error("[MoMo] Transaction status check failed", e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
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
