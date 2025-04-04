package com.example.scent.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service

public class OtpService {
    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();
    private static final long EXPIRATION = 90 * 1000; // 30 giây
    @Async
    public String generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000); // OTP 6 chữ số
        otpCache.put(email, new OtpEntry(otp, System.currentTimeMillis() + EXPIRATION));
        return otp;
    }
    @Async
    public boolean validateOtp(String email, String otp) {
        OtpEntry entry = otpCache.get(email);
        if (entry == null || System.currentTimeMillis() > entry.getExpiryTime()) {
            otpCache.remove(email);  // OTP đã hết hạn, xóa
            return false;
        }
        return entry.getOtp().equals(otp);  // Kiểm tra sự khớp của OTP
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
