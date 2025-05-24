package com.example.scent.service;


import com.example.scent.dto.TaiKhoanUpdateRequestDTO;
import com.example.scent.entity.AccountDetail;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.reques.NhanVienRequest;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaiKhoanSv implements UserDetailsService {
    final
    TaiKhoanInterface tki;
    @Autowired
    private MailService mailService;

    public TaiKhoanSv(TaiKhoanInterface tki) {
        this.tki = tki;
    }


    public List<TaiKhoan> getAll() {
        return tki.findAll();
    }


    public TaiKhoan add(TaiKhoan tk) {
        return tki.save(tk);
    }


    public TaiKhoan update(TaiKhoan tk) {
        return tki.save(tk);
    }


    public void delete(Integer id) {
        tki.deleteById(id);
    }


    public TaiKhoan detail(Integer id) {
        return tki.findById(id).get();
    }

    @Autowired
    /*trì hoãn việc khởi tạo bean lập tức, chỉ khởi tạo khi được yêu cầu tới
    tránh lỗi vòng lặp phụ thuộc, nên dùng cho bean ít được gọi tới hơn*/
    @Lazy
    AuthenticationManager aum;
    @Autowired
    @Lazy
    JWTSv js;

    public String verify(TaiKhoan taiKhoan) {
        System.out.println("Nhận đối tượng taiKhoan từ Postman: " + (taiKhoan != null ? taiKhoan.toString() : "null"));
        if (taiKhoan == null || taiKhoan.getTenDangNhap() == null || taiKhoan.getMatKhau() == null) {
            System.out.println("Tài khoản không hợp lệ, trả về fail");
            return "fail";
        }

        // Truy vấn tài khoản từ DB để lấy trạng thái
        TaiKhoan taiKhoanFromDb = tki.findByTenDangNhap(taiKhoan.getTenDangNhap())
                .orElse(null);
        if (taiKhoanFromDb == null) {
            System.out.println("Không tìm thấy tài khoản: " + taiKhoan.getTenDangNhap());
            return "Sai mật khẩu hoặc tài khoản không tồn tại";
        }

        System.out.println("Tài khoản từ DB: " + taiKhoanFromDb.toString());
        Integer trangThai = taiKhoanFromDb.getTrangThai();
        System.out.println("Trạng thái tài khoản: " + trangThai + " cho tài khoản: " + taiKhoanFromDb.getTenDangNhap());
        if (trangThai == null || trangThai != 1) {
            System.out.println("Tài khoản bị khóa hoặc trạng thái null");
            return "Tài khoản đã bị khóa";
        }

        try {
            System.out.println("Bắt đầu xác thực với tên đăng nhập: " + taiKhoan.getTenDangNhap());
            System.out.println("Mật khẩu nhập vào: " + taiKhoan.getMatKhau());
            Authentication auth = aum.authenticate(
                    new UsernamePasswordAuthenticationToken(taiKhoan.getTenDangNhap(), taiKhoan.getMatKhau())
            );
            if (auth.isAuthenticated()) {
                String token = js.generateToken(taiKhoan.getTenDangNhap());
                System.out.println("Xác thực thành công, token: " + token);
                return token;
            } else {
                System.out.println("Xác thực thất bại: không được xác thực");
                return "Sai mật khẩu hoặc tài khoản không tồn tại";
            }
        } catch (AuthenticationException e) {
            System.out.println("Lỗi xác thực: " + e.getMessage());
            return "Sai mật khẩu hoặc tài khoản không tồn tại";
        }
    }
    @Override
    //lấy ra tk từ tên đăng nhập
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        /*trường username là khóa chính nên dùng findById được, nếu username ko phải khóa chính
        mà dùng findById sẽ lỗi*/
        Optional<TaiKhoan> taiKhoan = Optional.ofNullable(tki.findByUsername(username));
        if (taiKhoan == null) {
            System.out.println("404 not found!");
            throw new UsernameNotFoundException("404 not found!");
        }
        return new AccountDetail(taiKhoan.get());
    }
    private BCryptPasswordEncoder e = new BCryptPasswordEncoder(12);
    public TaiKhoan create(TaiKhoan taiKhoan) {
        // Kiểm tra xem tên tài khoản đã tồn tại hay chưa
        Optional<TaiKhoan> existingAccount = tki.findByTenDangNhap(taiKhoan.getTenDangNhap());
        if (existingAccount.isPresent()) {
            throw new RuntimeException("Tên tài khoản đã tồn tại");
        }

        // Xử lý vai trò: nếu không có vai trò được cung cấp, sử dụng "USER"
        if (taiKhoan.getVaiTro() == null || taiKhoan.getVaiTro().isEmpty()) {
            taiKhoan.setVaiTro("USER");
        }

        // Mã hóa mật khẩu trước khi lưu
        taiKhoan.setMatKhau(e.encode(taiKhoan.getMatKhau()));
taiKhoan.setTrangThai(1);
        // Lưu tài khoản mới
        return tki.save(taiKhoan);
    }


    public Page<TaiKhoan> getPageTaiKhoan(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tki.findAll(pageable);
    }public Page<TaiKhoan> searchByTerm(String searchTerm, Pageable pageable) {
        return tki.findBySearchTerm(searchTerm, pageable);
    }

    public Page<TaiKhoan> getUserAccounts(
            String keyword, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return tki.searchByRoleAndKeyword("USER", keyword, pageable);
    }
    public Page<TaiKhoan> getStaffAccounts(
            String keyword, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return tki.searchByRoleAndKeyword("STAFF", keyword, pageable);
    }
    public Optional<TaiKhoan> findByEmail(String email) {
        return tki.findByEmail(email);
    }
    public TaiKhoan getTaiKhoanById(Integer id) {
        return tki.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tài khoản không tồn tại với ID: " + id));
    }
    public TaiKhoan findByUsername(String username) {
        return tki.findByUsername(username);
    }

    public void resetPassword(TaiKhoan tk, String newPassword) {
        tk.setMatKhau(new BCryptPasswordEncoder().encode(newPassword));
        tki.save(tk);
    }

    public boolean passwordMatches(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }

    public String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8); // 8 ký tự ngẫu nhiên
    }
    public TaiKhoan updateTaiKhoan(TaiKhoanUpdateRequestDTO updatedTaiKhoan) {
        TaiKhoan tk = tki.findById(updatedTaiKhoan.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với id: " + updatedTaiKhoan.getId()));
        tk.setHoTen(updatedTaiKhoan.getHoTen());
        tk.setEmail(updatedTaiKhoan.getEmail());
        tk.setSdt(updatedTaiKhoan.getSdt());
        return tki.save(tk);
    }
    public boolean verifyOldPassword(String username, String oldPassword) {
        Optional<TaiKhoan> tkOpt = Optional.ofNullable(tki.findByUsername(username));
        if (tkOpt.isEmpty()) {
            return false; // Tài khoản không tồn tại
        }
        TaiKhoan tk = tkOpt.get();
        return passwordMatches(oldPassword, tk.getMatKhau()); // Kiểm tra mật khẩu
    }
    public List<TaiKhoan> findBySdtStartingWithAndVaiTro(String sdt, String vaiTro) {
        return tki.findBySdtStartingWithAndVaiTro(sdt, vaiTro);
    }
    public TaiKhoan setTrangThaiByIdTaiKhoan(Integer IdTaiKhoan, Integer TrangThai) {
        TaiKhoan tk = tki.findById(IdTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với id: " + IdTaiKhoan));
         tk.setTrangThai(TrangThai);
         return tki.save(tk);
    }
    public TaiKhoan createNhanVien(NhanVienRequest request) {
        // Kiểm tra email và username đã tồn tại
        if (findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        if (findByUsername(request.getUsername())!=null) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        }

        // Kiểm tra định dạng email
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }

        // Kiểm tra định dạng số điện thoại (ví dụ: 10-11 chữ số)
        if (request.getSoDienThoai() == null || !request.getSoDienThoai().matches("^\\d{10,11}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ");
        }

        // Kiểm tra họ tên và tên đăng nhập không rỗng
        if (request.getHoTen() == null || request.getHoTen().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống");
        }
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống");
        }

        // Tạo tài khoản mới
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setHoTen(request.getHoTen().trim());
        taiKhoan.setEmail(request.getEmail().trim());
        taiKhoan.setSdt(request.getSoDienThoai().trim());
        taiKhoan.setTenDangNhap(request.getUsername().trim());
        taiKhoan.setVaiTro("STAFF");
        // Tạo và mã hóa mật khẩu
        String newPassword = generateRandomPassword();
        taiKhoan.setMatKhau(BCrypt.hashpw(newPassword, BCrypt.gensalt()));

        // Lưu tài khoản
        TaiKhoan savedTaiKhoan = tki.save(taiKhoan);

        // Gửi email chứa username và password
        mailService.sendNewAccountEmail(request.getEmail(), request.getUsername(), newPassword, request.getHoTen());

        return savedTaiKhoan;
    }
}
