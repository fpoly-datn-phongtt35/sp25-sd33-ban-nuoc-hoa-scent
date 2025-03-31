package com.example.scent.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();
    private static final long EXPIRATION = 90 * 1000; // 30 giây

    public String generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000); // OTP 6 chữ số
        otpCache.put(email, new OtpEntry(otp, System.currentTimeMillis() + EXPIRATION));
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        OtpEntry entry = otpCache.get(email);
        if (entry == null || System.currentTimeMillis() > entry.getExpiryTime()) {
            otpCache.remove(email);  // OTP đã hết hạn, xóa
            return false;
        }
        return entry.getOtp().equals(otp);  // Kiểm tra sự khớp của OTP
    }

    @Data
    @AllArgsConstructor
    private static class OtpEntry {
        private String otp;
        private long expiryTime;
    }
}
