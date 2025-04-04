package com.example.scent.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();
    private static final long EXPIRATION = 90 * 1000; // 90 giây

    @Async
    public CompletableFuture<String> generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000); // OTP 6 chữ số
        otpCache.put(email, new OtpEntry(otp, System.currentTimeMillis() + EXPIRATION));
        return CompletableFuture.completedFuture(otp);
    }

    @Async
    public CompletableFuture<Boolean> validateOtp(String email, String otp) {
        OtpEntry entry = otpCache.get(email);
        if (entry == null || System.currentTimeMillis() > entry.getExpiryTime()) {
            otpCache.remove(email); // OTP hết hạn, xóa
            return CompletableFuture.completedFuture(false);
        }
        return CompletableFuture.completedFuture(entry.getOtp().equals(otp));
    }

    private static class OtpEntry {
        private String otp;
        private long expiryTime;

        public OtpEntry() {
        }

        public OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public long getExpiryTime() {
            return expiryTime;
        }

        public void setExpiryTime(long expiryTime) {
            this.expiryTime = expiryTime;
        }
    }
}