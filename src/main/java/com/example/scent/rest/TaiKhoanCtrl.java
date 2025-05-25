package com.example.scent.rest;

import com.example.scent.dto.TaiKhoanUpdateRequestDTO;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.reques.NhanVienRequest;
import com.example.scent.service.TaiKhoanSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    @GetMapping("/users")
    public List<TaiKhoan> getUsers() {
        return taiKhoanInterface.findAll().stream()
                .filter(taiKhoan -> "USER".equals(taiKhoan.getVaiTro()))
                .toList();
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
    public ResponseEntity<Map<String, Object>> sendOtpForUser(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra email tồn tại
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản.");
            return ResponseEntity.badRequest().body(response);
        }

        // Tạo OTP
        CompletableFuture<String> otpFuture = otpService.generateOtp(email);
        String otp;
        try {
            otp = otpFuture.get(); // Chờ và lấy giá trị OTP
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Đã xảy ra lỗi khi tạo OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }

        // Gửi email OTP
        try {
            mailService.sendOtpEmail(email, otp);
            response.put("success", true);
            response.put("message", "OTP đã được gửi tới email của bạn.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Không thể gửi OTP. Vui lòng thử lại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
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
        String newPassword = tks.generateRandomPassword();
        tks.resetPassword(tk, newPassword);
        mailService.sendNewPasswordEmail(email, tk.getTenDangNhap(), newPassword); // Truyền thêm username
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
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        Map<String, Object> response = new HashMap<>();

        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Không tìm thấy tài khoản.");
            return ResponseEntity.badRequest().body(response);
        }

        TaiKhoan tk = tkOpt.get();

        boolean valid = otpService.validateOtp(email, otp).join();
        if (!valid) {
            response.put("success", false);
            response.put("message", "OTP không hợp lệ hoặc đã hết hạn.");
            return ResponseEntity.badRequest().body(response);
        }

        tks.resetPassword(tk, newPassword);
        mailService.sendNewPasswordEmail(email,tk.getTenDangNhap(), newPassword);
        response.put("success", true);
        response.put("message", "Mật khẩu đã được đặt lại thành công.");
        return ResponseEntity.ok(response);
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
    public ResponseEntity<Map<String, Object>> findByEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        Optional<TaiKhoan> tkOpt = tks.findByEmail(email);
        if (tkOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email không tồn tại trong hệ thống.");
            return ResponseEntity.badRequest().body(response);
        }
        response.put("success", true);
        response.put("message", "Email hợp lệ.");
        return ResponseEntity.ok(response);
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
    @PostMapping(value = "/nhan-vien/create", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> createNhanVien(@RequestBody NhanVienRequest request) {
        try {
            TaiKhoan taiKhoan = tks.createNhanVien(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tài khoản nhân viên đã được tạo và email đã được gửi");
            response.put("data", Map.of(
                    "username", taiKhoan.getTenDangNhap(),
                    "email", taiKhoan.getEmail(),
                    "hoTen", taiKhoan.getHoTen(),
                    "soDienThoai", taiKhoan.getSdt()
            ));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Đã xảy ra lỗi khi tạo tài khoản: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    @GetMapping("/findByPhoneNumber")
    public ResponseEntity<Map<String, Object>> findByPhoneNumber(@RequestParam String soDienThoai) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<TaiKhoan> taiKhoan = taiKhoanInterface.findBySdt(soDienThoai);
            if (taiKhoan.isPresent()) {
                response.put("success", false);
                response.put("message", "Số điện thoại đã tồn tại");
            } else {
                response.put("success", true);
                response.put("message", "Số điện thoại chưa tồn tại");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Số điện thoại đã tồn tại");
        }
        return ResponseEntity.ok(response);
    }
}