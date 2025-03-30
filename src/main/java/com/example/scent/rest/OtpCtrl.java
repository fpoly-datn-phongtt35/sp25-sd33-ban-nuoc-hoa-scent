package com.example.scent.rest;

import com.example.scent.service.MailService;
import com.example.scent.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        String otp = otpService.generateOtp(email);
        mailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP đã được gửi đến email!");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean valid = otpService.validateOtp(email, otp);
        return valid ?
                ResponseEntity.ok("OTP hợp lệ. Bạn có thể đặt lại mật khẩu.") :
                ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn.");
    }
}
