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
   //OTPEMAIL Mật Khẩu
    //API Gửi OTP cho USER (Chỉ dành cho USER)
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

       // Tạo OTP và gửi tới email
       String otp = otpService.generateOtp(email);
       mailService.sendOtpEmail(email, otp);

       return ResponseEntity.ok("OTP đã gửi tới email của bạn");
   }
//API Cấp lại Mật khẩu cho ADMIN và STAFF (Gửi mật khẩu mới)
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

    // Tạo mật khẩu mới cho ADMIN hoặc STAFF
    String newPassword = tks.generateRandomPassword();
    tks.resetPassword(tk, newPassword);

    // Gửi mật khẩu mới qua email
    mailService.sendNewPasswordEmail(email, newPassword);

    return ResponseEntity.ok("Mật khẩu mới đã được gửi tới email");
}
// Đổi Mật khẩu cho ADMIN, STAFF và USER (Cần mật khẩu cũ)
//Đổi mật khẩu thì thôi OTP làm đếch gì hoặc nếu OTP thì lấy
// bên OtpCtrl xử lí nếu được thì mới cho đổi(xử lí bên fe)
@PutMapping("/change-password")
public ResponseEntity<String> changePassword(
        @RequestParam String username,
        @RequestParam String oldPassword,
        @RequestParam String newPassword) {

    Optional<TaiKhoan> tkOpt = Optional.ofNullable(tks.findByUsername(username));
    if (tkOpt.isEmpty()) return ResponseEntity.badRequest().body("Tài khoản không tồn tại");

    TaiKhoan tk = tkOpt.get();

    // Kiểm tra mật khẩu cũ
    if (!tks.passwordMatches(oldPassword, tk.getMatKhau())) {
        return ResponseEntity.badRequest().body("Mật khẩu cũ không đúng");
    }

    // Đặt lại mật khẩu
    tks.resetPassword(tk, newPassword);

    return ResponseEntity.ok("Đổi mật khẩu thành công");
}
//Tạm thời thì chỉ tính được vậy thôi khi nào làm fe rồi tính tiếp
}

