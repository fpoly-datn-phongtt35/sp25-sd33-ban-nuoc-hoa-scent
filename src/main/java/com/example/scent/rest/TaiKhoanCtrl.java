package com.example.scent.rest;

import com.example.scent.dto.TaiKhoanUpdateRequestDTO;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.service.TaiKhoanSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/tai-khoan")
public class TaiKhoanCtrl {
    final TaiKhoanSv tks;

    @Autowired
    private com.example.scent.service.OtpService otpService;

    @Autowired
    private com.example.scent.service.MailService mailService;

    @Autowired
    private TaiKhoanInterface taiKhoanInterface;

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
    public ResponseEntity<TaiKhoan> update(@RequestBody TaiKhoanUpdateRequestDTO dto) {
        TaiKhoan updated = tks.updateTaiKhoan(dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) {
        tks.delete(id);
    }

    @GetMapping("page")
    public Page<TaiKhoan> getAllTaiKhoan(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tks.searchByTerm(searchTerm, pageable);
    }

    @GetMapping("/get-staff-accounts")
    public ResponseEntity<Page<TaiKhoan>> getStaffAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<TaiKhoan> result = tks.getStaffAccounts(keyword, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get-user-accounts")
    public ResponseEntity<Page<TaiKhoan>> getUserAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<TaiKhoan> result = tks.getUserAccounts(keyword, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password/sendOTP")
    public ResponseEntity<String> sendOtpForUser(@RequestParam String email) {
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản");
        }

        TaiKhoan tk = tkOpt.get();
        if (!"USER".equalsIgnoreCase(tk.getVaiTro())) {
            return ResponseEntity.status(403).body("Chỉ USER mới có thể yêu cầu OTP");
        }

        CompletableFuture<String> otpFuture = otpService.generateOtp(email);
        String otp;
        try {
            otp = otpFuture.get(); // Chờ và lấy giá trị String từ CompletableFuture
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đã xảy ra lỗi khi tạo OTP: " + e.getMessage());
        }
        mailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP đã gửi tới email của bạn");
    }

    @GetMapping("/{idTaiKhoan}")
    public ResponseEntity<TaiKhoan> getTaiKhoanById(@PathVariable Integer idTaiKhoan) {
        TaiKhoan taiKhoan = tks.getTaiKhoanById(idTaiKhoan);
        return ResponseEntity.ok(taiKhoan);
    }
    @PostMapping("/forgot-password/reset-admin-staff")
    public ResponseEntity<String> resetPasswordAdminAndStaff(@RequestParam String email) {
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản");
        }

        TaiKhoan tk = tkOpt.get();
        if (!"ADMIN".equalsIgnoreCase(tk.getVaiTro()) && !"STAFF".equalsIgnoreCase(tk.getVaiTro())) {
            return ResponseEntity.status(403).body("Chỉ ADMIN hoặc STAFF mới có thể sử dụng phương thức này");
        }

        String newPassword = tks.generateRandomPassword();
        tks.resetPassword(tk, newPassword);
        mailService.sendNewPasswordEmail(email, newPassword);
        return ResponseEntity.ok("Mật khẩu mới đã được gửi tới email");


    }

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
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tài khoản.");
        }

        TaiKhoan tk = tkOpt.get();
        if (!"USER".equalsIgnoreCase(tk.getVaiTro())) {
            return ResponseEntity.status(403).body("Chỉ USER mới được phép sử dụng phương thức này.");
        }

        boolean valid = otpService.validateOtp(email, otp).join();
        if (!valid) {
            return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn.");
        }

        tks.resetPassword(tk, newPassword);
        mailService.sendNewPasswordEmail(email, newPassword);
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
    }
    // Thêm endpoint để lấy thông tin người dùng theo username
    @GetMapping("/findByUsername")
    public ResponseEntity<TaiKhoan> findByUsername(@RequestParam("username") String username) {
        TaiKhoan taiKhoan = tks.findByUsername(username);
        if (taiKhoan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(taiKhoan);
    }
    @GetMapping("/verify-old-password")
    public ResponseEntity<String> verifyOldPassword(
            @RequestParam String username,
            @RequestParam String oldPassword) {
        // Sử dụng hàm riêng để kiểm tra mật khẩu cũ
        if (!tks.verifyOldPassword(username, oldPassword)) {
            return ResponseEntity.badRequest().body("Mật khẩu cũ không đúng hoặc tài khoản không tồn tại");
        }
        return ResponseEntity.ok("Mật khẩu cũ hợp lệ");
    }
    @GetMapping("/findByEmail")
    public TaiKhoan findByEmail(@RequestParam("email") String email) {
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);

        if (tkOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TaiKhoan not found for email: " + email);
        }

        TaiKhoan tk = tkOpt.get();
        // Check if the role (vai_tro) is "USER"
        if (!"USER".equalsIgnoreCase(tk.getVaiTro())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TaiKhoan with email " + email + " does not have role USER");
        }

        // Return the TaiKhoan with 200 OK (default status for a successful response)
        return tk;
    }

    @GetMapping("/search-by-sdt")
    public ResponseEntity<List<TaiKhoan>> searchTaiKhoanBySdt(@RequestParam String sdt) {
        List<TaiKhoan> taiKhoanList = tks.findBySdtStartingWithAndVaiTro(sdt, "USER");
        return ResponseEntity.ok(taiKhoanList);
    }
   @PutMapping("setTrangThaiByIdTaiKhoan/{id}")
   public ResponseEntity<TaiKhoan> setTrangThaiByIdTaiKhoan(
           @PathVariable Integer id,
           @RequestParam("trangThai") Integer trangThai
   ){
        TaiKhoan tkUpdate= tks.setTrangThaiByIdTaiKhoan(id, trangThai);
       return ResponseEntity.ok(tkUpdate);

   }

}