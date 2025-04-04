package com.example.scent.rest;

import com.example.scent.service.MailService;
import com.example.scent.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/rest/otp")
@CrossOrigin("*")
public class OtpCtrl {

    @Autowired
    private OtpService otpService;

    @Autowired
    private MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        CompletableFuture<String> otpFuture = otpService.generateOtp(email);
        String otp;
        try {
            otp = otpFuture.get(); // Chờ và lấy giá trị String từ CompletableFuture
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đã xảy ra lỗi khi tạo OTP: " + e.getMessage());
        }
        mailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP đã được gửi đến email!");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        CompletableFuture<Boolean> validFuture = otpService.validateOtp(email, otp);
        try {
            Boolean valid = validFuture.get(); // Lấy giá trị Boolean từ CompletableFuture
            return valid ?
                    ResponseEntity.ok("OTP hợp lệ. Bạn có thể đặt lại mật khẩu.") :
                    ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đã xảy ra lỗi khi xác thực OTP: " + e.getMessage());
        }
    }
}
