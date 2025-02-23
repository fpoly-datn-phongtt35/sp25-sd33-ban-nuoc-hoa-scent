package com.example.scent.service;


import com.example.scent.entity.AccountDetail;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaiKhoanSv implements UserDetailsService {
    final
    TaiKhoanInterface tki;

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
        Authentication auth =
                //thực hiện xác thực với instance đã được tiêm vào
                aum.authenticate(new UsernamePasswordAuthenticationToken(taiKhoan.getTenDangNhap(), taiKhoan.getMatKhau()));
        //khi login sẽ kiểm tra auth có được xác thực hay ko(tk mk có đúng hay ko)
        if (auth.isAuthenticated()) {
            return js.generateToken(taiKhoan.getTenDangNhap());
        } else {
            return "fail";
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

        // Lưu tài khoản mới
        return tki.save(taiKhoan);
    }
}
