package com.example.scent.rest;

import com.example.scent.entity.TaiKhoan;
import com.example.scent.service.TaiKhoanSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/tai-khoan")
public class TaiKhoanCtrl {
    final
    TaiKhoanSv tks;
    @Autowired
    private com.example.scent.service.OtpService otpService;

    @Autowired
    private com.example.scent.service.MailService mailService;

    public TaiKhoanCtrl(TaiKhoanSv tks) {
        this.tks = tks;
    }
    @PostMapping("login")
    public String login(@RequestBody TaiKhoan taiKhoan) {
        return tks.verify(taiKhoan);
    }
    @PostMapping("register")
    public TaiKhoan register(@RequestBody TaiKhoan taiKhoan) {
        return tks.create(taiKhoan);
    }


    @GetMapping("/getAll")
    public List<TaiKhoan> getAll() {
        return tks.getAll();
    }

    @PostMapping("/add")
    public TaiKhoan create(@RequestBody TaiKhoan tk) {
        return tks.add(tk);
    }

    @PutMapping("/update")
    public TaiKhoan update(@RequestBody TaiKhoan tk) {
        return tks.update(tk);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { tks.delete(id);
    }
    @GetMapping("page")
    public Page<TaiKhoan> getAllTaiKhoan(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
           ) {
        Pageable pageable = PageRequest.of(page, size);
        return tks.searchByTerm(searchTerm,pageable);
    }
    @GetMapping("/get-staff-accounts")
    public ResponseEntity<Page<TaiKhoan>> getStaffAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<TaiKhoan> result = tks.getStaffAccounts( keyword, page, size);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/get-user-accounts")
    public ResponseEntity<Page<TaiKhoan>> getUserAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<TaiKhoan> result = tks.getUserAccounts( keyword, page, size);
        return ResponseEntity.ok(result);
    }
    //OTP Quên Mật khẩu
    // Forgot password (send OTP or new password depending on role)
    //ADMIN hoặc STAFF send email này là cấp cmn mật khẩu mới về email luôn
    @PostMapping("/forgot-password/sendOTP")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản");
        }

        TaiKhoan tk = tkOpt.get();
        String role = tk.getVaiTro().toUpperCase();

        // For USER role, send OTP
        if ("USER".equals(role)) {
            String otp = otpService.generateOtp(email);
            mailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("OTP đã gửi tới email");
        } else { // For STAFF/ADMIN role, send new password
            String newPassword = tks.generateRandomPassword();
            tks.resetPassword(tk, newPassword);
            mailService.sendNewPasswordEmail(email, newPassword);
            return ResponseEntity.ok("Mật khẩu mới đã được gửi tới email");
        }
    }

    // Reset password after OTP verification (only for USER)
    // Xác thực OTP và đặt lại mật khẩu (chỉ cho USER)
    @PutMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPasswordUser(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản");
        }

        TaiKhoan tk = tkOpt.get();
        if (!"USER".equalsIgnoreCase(tk.getVaiTro())) {
            return ResponseEntity.status(403).body("Chỉ USER được phép dùng OTP");
        }

        // So sánh OTP
        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn");
        }

        // Đặt lại mật khẩu nếu OTP hợp lệ
        tks.resetPassword(tk, newPassword);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }


    // Change password (requires old password)
    //Dùng cho ADMIN hoặc STAFF
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestParam String username,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        Optional<TaiKhoan> tkOpt = Optional.ofNullable(tks.findByUsername(username));
        if (tkOpt.isEmpty()) return ResponseEntity.badRequest().body("Tài khoản không tồn tại");

        TaiKhoan tk = tkOpt.get();
        if (!tks.passwordMatches(oldPassword, tk.getMatKhau())) {
            return ResponseEntity.badRequest().body("Mật khẩu cũ không đúng");
        }

        tks.resetPassword(tk, newPassword);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

}

