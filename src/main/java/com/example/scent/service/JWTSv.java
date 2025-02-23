package com.example.scent.service;

import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTSv {
    @Autowired
    TaiKhoanInterface tki;
    private String key = "";

    //tạo ra signature được mã hóa
    public JWTSv() {
        try {
            //thực thể dùng để tạo ra signature sử dụng thuật toán HmacSHA256
            KeyGenerator g = KeyGenerator.getInstance("HmacSHA256");
            //tạo ra signature
            SecretKey sk = g.generateKey();
            //mã hóa signature thành chuỗi Base64 và lưu vào biến key
            key = Base64.getEncoder().encodeToString(sk.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    //tạo ra jwt
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        String role = tki.getRole(username);
        claims.put("roles", role);
        TaiKhoan tk = tki.findByUsername(username);
        claims.put("UserID", tk.getId());
        return Jwts.builder()
                .claims()//bản đồ chứa các cấu hình payload tùy chỉnh của jwt
                .add(claims)
                .subject(username) //đặt subject là username
                .issuedAt(new Date(System.currentTimeMillis())) //thời gian phát hành và có hiệu lực là thời điểm được tạo
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) //jwt sẽ hết hạn sau 60s từ thời điểm được tạo ra
                .and()
                .signWith(getKey()) //ký jwt bằng phương thức đã tạo
                .compact(); //tạo và trả về jwt dưới da23
    }


    public String extractUsername(String token) {
        //xuất username từ jwt
        return extractClaim(token, Claims::getSubject); //claims là các trường trong payload
    }

    //truyền claims đã lấy được vào cho resolver xử lý
    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaim(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaim(String token) {
        return Jwts.parser()
                .verifyWith(getKey()) //xác thực trước khi lấy ra
                .build().parseSignedClaims(token).getPayload(); //lấy tất cả claims từ token
    }

    //kiểm tra tính hợp lệ của token dựa trên username và hạn sd

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    //kiểm tra token hết hạn hay chưa
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    //lấy ra thời điểm hết hạn của token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private SecretKey getKey() {
        byte[] keyAsBytes = Decoders.BASE64.decode(key); //chuyển signature thành mảng byte
        return Keys.hmacShaKeyFor(keyAsBytes); //tạo ra và trả về key với đầu vào là mảng byte
    }
}
