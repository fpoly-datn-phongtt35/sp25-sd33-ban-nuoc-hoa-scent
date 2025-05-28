package com.example.scent.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpMethod;

import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;

@Configuration
@EnableWebSecurity // dùng filter chain tùy chỉnh thay cho mặc định
@EnableMethodSecurity
public class SecurityConfig {
  @Autowired
  @Lazy
  private UserDetailsService userDetailsService;
  @Autowired
  private JWTFilter jwtFilter;

  @Bean
  // bộ lọc áp dụng cho http request được spring container quản lý
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    // csrf token là đoạn mã đi kèm xác thực cho post put delete
    return http.csrf(c -> c.disable()) // tắt csrf protection
        .authorizeHttpRequests(r -> r
            /*
             * ko yêu cầu xác thực cho 2 request này (ko chỉ phục vụ cho mục đích
             * test, mà còn vì trong thực tế
             * yêu cầu xác thực mới cho đăng ký hay đăng nhập là ngu
             */
            .requestMatchers("/rest/tai-khoan/register", "/rest/tai-khoan/login", "/rest/danh-muc/getAll",
                "rest/tai-khoan/getAll", "rest/tai-khoan/page",
                "rest/tai-khoan/update", "rest/tai-khoan/del/**",
                "rest/tai-khoan/get-staff-accounts",
                "rest/tai-khoan/get-user-accounts",
                "rest/phong-cach", "rest/phong-cach/**",
                "rest/mui-huong", "rest/mui-huong/**",
                "rest/not-huong", "rest/not-huong/**",
                "rest/thuong-hieu/deactivate/thuong-hieu/**", "rest/thuong-hieu/restore/thuong-hieu/**")
            .permitAll()
            .requestMatchers("/rest/nhom-huong/paged/**", "/rest/thuong-hieu/**", "/rest/thuong-hieu/getAll")
            .permitAll()
            .requestMatchers("/rest/thuong-hieu", "/rest/thuong-hieu/**", "/rest/thuong-hieu/**",
                "/rest/thuong-hieu/**")
            .permitAll()
            .requestMatchers("rest/huong-dau/add", "rest/huong-giua/add",
                "rest/huong-cuoi/add")
            .permitAll()
            .requestMatchers("/rest/khach-hang/getAll", "rest/khach-hang/page",
                "rest/khach-hang/add", "rest/khach-hang/update/**",
                "rest/khach-hang/del/**")
            .permitAll()
            .requestMatchers(("rest/momo/pay"), "rest/momo/check-status",
                "rest/momo/callback")
            .permitAll()
            .requestMatchers("/rest/don-hang/getAll",
                "/rest/don-hang/by-don-hang/**",
                "/rest/offline-orders/status/**",
                "/rest/don-hang/lich-su-thao-tac-by-user/**",
                "/rest/don-hang/huy/**",
                "/rest/don-hang/capnhat-trangthai/**", "/rest/don-hang",
                "/rest/don-hang/add", "rest/don-hang/update",
                "/rest/don-hang/don-hang/page1", "/rest/don-hang/**",
                "rest/don-hang/page", "rest/don-hang/del/**")
            .permitAll()
            .requestMatchers("rest/phieu-giam-gia/getAll",
                "rest/phieu-giam-gia/add", "rest/phieu-giam-gia/del/**",
                "rest/phieu-giam-gia/update",
                "rest/phieu-giam-gia/page","/rest/phieu-giam-gia/send-coupon",
                    "rest/tai-khoan/nhan-vien/create","/rest/phieu-giam-gia/users")
            .permitAll()
            .requestMatchers("rest/tai-khoan/change-password",
                "rest/tai-khoan/forgot-password/reset-admin-staff",
                "rest/tai-khoan/forgot-password/sendOTP",
                "rest/tai-khoan/verify-old-password",
                "rest/tai-khoan/findByUsername",
                "rest/tai-khoan/findByEmail",
                "rest/tai-khoan/forgot-password/reset"
            ,"rest/phieu-giam-gia/update-status/**",
                    "rest/tai-khoan/findByPhoneNumber")
            .permitAll()
            .requestMatchers("rest/otp/send",
                "rest/otp/verify")
            .permitAll()
            .requestMatchers("rest/san-pham/updateTrangThai/**",
                "rest/spct/updateTrangThai/**")
            .permitAll()
            .requestMatchers("rest/offline-orders",
                "rest/offline-orders/getAll-sptq")
            .permitAll()
            .requestMatchers("/rest/phieu-giam-gia/**").permitAll()
            .requestMatchers("/rest/san-pham/**", "/rest/san-pham/detail/**",
                "/rest/san-pham/volums/**",
                "/rest/san-pham/search-price/**",
                "/rest/san-pham/search/**",
                "/rest/san-pham/search-danhmuc/**",
                "rest/san-pham/sorted",
                    "/rest/san-pham/top-selling-products")
            .permitAll()
            .requestMatchers("rest/nhom-huong", "rest/nhom-huong/**").permitAll()
            .requestMatchers("/rest/san-pham/All", "/rest/san-pham/detail/**",
                "/rest/san-pham/add", "/rest/san-pham/update",
                "/rest/san-pham/volums/**",
                "/rest/san-pham/search-combined",
                "/rest/san-pham/search/**",
                "/rest/san-pham/search-danhmuc/**",
                "rest/san-pham/sorted", "san-pham/getAll",
                "rest/san-pham/findAllHinhAnhById",
                "rest/san-pham/findById")
            .permitAll()
            .requestMatchers("rest/mui-huong/getAll", "rest/not-huong/getAll",
                "rest/phong-cach/getAll", "rest/not-huong/add",
                "rest/phong-cach/add", "rest/mui-huong/add",
                "rest/mui-huong/updateMuiHuongs/**",
                "rest/not-huong/updateNotHuongs/**",
                "rest/phong-cach/updatePhongCachs/**")
            .permitAll()
            .requestMatchers("rest/spct/getAll", "rest/spct/getByidSanPham/**",
                "/all/dia-chi/get-tinh-thanh",
                "/rest/don-hang/importData", "rest/don-hang/getByIdTaiKhoan/")
            .permitAll()
            .requestMatchers("/rest/dia-chi/get-tinh-thanh",
                "/rest/dia-chi/tinh-phi-van-chuyen",
                "/rest/dia-chi/get-phuong-xa/**",
                "/rest/dia-chi/get-quan-huyen/**")
            .permitAll()

            .requestMatchers("/rest/san-pham/All", "/rest/san-pham/detail/**",
                "rest/san-pham/search-product-on-admin",
                "/rest/san-pham/add", "/rest/san-pham/update",
                "/rest/san-pham/volums/**",
                "/rest/san-pham/search-price/**",
                "/rest/san-pham/search/**",
                "/rest/san-pham/search-danhmuc/**",
                "rest/san-pham/sorted","/rest/san-pham/sorted-by-price/**")
            .permitAll()

            .requestMatchers("rest/spct/getAll", "rest/spct/getByidSanPham/**",
                "rest/spct/add")
            .permitAll()
            .requestMatchers("/api/cart/clear/**", "/api/cart/remove/**",
                "/api/cart/update/**", "/api/cart/add/**",
                "/api/cart/**")
            .permitAll()

            .requestMatchers("rest/spct/getAll", "rest/spct/getByidSanPham/**",
                "rest/spct/add", "rest/spct/update")
            .permitAll()
            .requestMatchers("/api/thong-ke/doanh-thu/nam",
                "/api/thong-ke/doanh-thu/thang",
                "/api/thong-ke/doanh-thu/tuan",
                "/api/thong-ke/doanh-thu/ngay",
                "/api/thong-ke/so-luong-don/nam",
                "/api/thong-ke/so-luong-don/thang",
                "/api/thong-ke/so-luong-don/tuan",
                "/api/thong-ke/so-luong-don/ngay",
                "/api/thong-ke/tong-quan",
                "/api/thong-ke/count-by-luong-ban-trang-thai",
                "/api/thong-ke/tong-quan/tuan/**",
                "/api/thong-ke/tong-quan/thang",
                "/api/thong-ke/tong-quan/nam",
                "/api/thong-ke/tong-quan/ngay",
                "/api/thong-ke/best-selling/ngay",
                "/api/thong-ke/best-selling/tuan",
                "/api/thong-ke/best-selling/thang",
                "/api/thong-ke/best-selling/nam")
            .permitAll()
            // // // // // // // // // // // // // // // // // // // // //
            .requestMatchers("/api/cart/remove-multiple/**",
                "/rest/don-hang/latest/**", "/rest/tai-khoan/**",
                "/rest/phieu-giam-gia/check/**", "/ws/**",
                "api/danhgia", "api/danhgia/sanpham/**",
                "/rest/don-hang/diachi/**",
                "/rest/don-hang/update-address/**")
            .permitAll()
            // .requestMatchers("rest/danh-gia-dich-vu/getAll").permitAll()
            // .requestMatchers("rest/thuong-hieu/getAll").permitAll()
            // .requestMatchers("rest/huong-dau/getAll").permitAll()
            // .requestMatchers("rest/huong-giua/getAll").permitAll()
            // .requestMatchers("rest/huong-cuoi/getAll").permitAll()
            // .requestMatchers("rest/phan-hoi/getAll").permitAll()
            // .requestMatchers("rest/thuong-hieu/getAll").permitAll()
            // .requestMatchers("rest/ctdh/getAll").permitAll()
            // còn lại request nào cũng cần xác thực mới cho phép

            .requestMatchers("rest/spct/getAll", "rest/spct/getByidSanPham/**", "rest/spct/add", "rest/spct/update")
            .permitAll()
            .requestMatchers("/api/thong-ke/doanh-thu/nam", "/api/thong-ke/doanh-thu/thang",
                "/api/thong-ke/doanh-thu/tuan", "/api/thong-ke/doanh-thu/ngay", "/api/thong-ke/so-luong-don/nam",
                "/api/thong-ke/so-luong-don/thang", "/api/thong-ke/so-luong-don/tuan",
                "/api/thong-ke/so-luong-don/ngay", "/api/thong-ke/tong-quan",
                "/api/thong-ke/count-by-luong-ban-trang-thai", "rest/nong-do", "/api/thong-ke/tong-quan/tuan",
                "/api/thong-ke/tong-quan/thang", "/api/thong-ke/tong-quan/nam", "/api/thong-ke/tong-quan/ngay",
                "/api/thong-ke/best-selling/ngay", "/api/thong-ke/best-selling/tuan",
                "/api/thong-ke/best-selling/thang", "/api/thong-ke/best-selling/nam",
                "rest/tai-khoan/setTrangThaiByIdTaiKhoan/**","/api/thong-ke/best-selling-products/filter/**","/api/thong-ke/best-selling-products/sort/**")
            .permitAll()
            // // // // // // // // // // // // // // // // // // // // //
            .requestMatchers("/rest/tai-khoan/users", "/api/chat/create-guest", "/api/chat/users-with-messages/**",
                "/api/chat/messages/user/**", "/api/chat/messages/**", "/api/chat/webhook/**",
                "/api/cart/remove-multiple/**", "/api/danhgia/user/**", "/api/danhgia/**", "/api/danhgia/sanpham/**",
                "/rest/san-pham/statuse/**", "/rest/tai-khoan/**", "/rest/spct/status/multiple", "/rest/spct/status/**",
                "/rest/tai-khoan/search-by-sdt/**", "/rest/san-pham/recommended", "/rest/don-hang/latest/**",
                "/rest/phieu-giam-gia/check/**","/rest/phieu-giam-gia/search/**", "/ws/**", "api/danhgia", "api/danhgia/sanpham/**",
                "/rest/don-hang/diachi/**", "/rest/don-hang/update-address/**")
            .permitAll()
            .requestMatchers("/api/chat/messages/user/{adminId}/{userId}").permitAll()
            .requestMatchers("/api/chat/add-user/**", "/api/chat/{productId}/details/**", "/api/chat/chat-search/**",
                "/api/thong-ke/top-san-pham/**", "/api/chat/recall/**", "/api/chat/brands",
                "/api/chat/products-by-brand/**", "/api/chat/fragrance-groups",
                "/api/chat/products-by-fragrance-group/**", "/api/chat/top-10-products")
            .permitAll()
                .requestMatchers("rest/spct/getAll","rest/spct/getByidSanPham/**","rest/spct/add","rest/spct/update").permitAll()
                .requestMatchers("/api/thong-ke/doanh-thu/nam","/api/thong-ke/doanh-thu/thang","/api/thong-ke/doanh-thu/tuan","/api/thong-ke/doanh-thu/ngay"
                        ,"/api/thong-ke/so-luong-don/nam","/api/thong-ke/so-luong-don/thang","/api/thong-ke/so-luong-don/tuan","/api/thong-ke/so-luong-don/ngay","/api/thong-ke/tong-quan","/api/thong-ke/count-by-luong-ban-trang-thai","rest/nong-do"
                        ,"/api/thong-ke/tong-quan/tuan","/api/thong-ke/tong-quan/thang","/api/thong-ke/tong-quan/nam","/api/thong-ke/tong-quan/ngay",
                        "/api/thong-ke/best-selling/ngay","/api/thong-ke/best-selling/tuan","/api/thong-ke/best-selling/thang","/api/thong-ke/best-selling/nam","rest/tai-khoan/setTrangThaiByIdTaiKhoan/**","/api/tra-hang").permitAll()
                .requestMatchers("/rest/tai-khoan/users","/api/chat/create-guest","/api/chat/users-with-messages/**","/api/chat/messages/user/**","/api/chat/messages/**","/api/chat/webhook/**","/api/cart/remove-multiple/**","/api/danhgia/user/**","/api/danhgia/**","/api/danhgia/sanpham/**","/rest/san-pham/statuse/**","/rest/tai-khoan/**","/rest/spct/status/multiple","/rest/spct/status/**","/rest/tai-khoan/search-by-sdt/**","/rest/san-pham/recommended","/rest/don-hang/latest/**","/rest/phieu-giam-gia/check/**","/ws/**","api/danhgia","api/danhgia/sanpham/**","/rest/don-hang/diachi/**","/rest/don-hang/update-address/**").permitAll()
                .requestMatchers("/api/chat/messages/user/{adminId}/{userId}").permitAll()
                .requestMatchers("/api/chat/add-user/**","/api/tra-hang/defective-products","/api/tra-hang/send-to-manufacturer/**","/api/chat/{productId}/details/**","/api/chat/chat-search/**","/api/thong-ke/top-san-pham/**","/api/chat/recall/**","/api/chat/brands","/api/chat/products-by-brand/**","/api/chat/fragrance-groups","/api/chat/products-by-fragrance-group/**","/api/chat/top-10-products").permitAll()
                .requestMatchers("/api/tra-hang/{idTaiKhoan}/history","/api/tra-hang/user/{idTaiKhoan}/**").permitAll()
                .requestMatchers("/api/banners/**","/api/banners/**","/api/banners/{id}/toggle-status","/api/banners/**","/api/banners/**","/api/banners/**","/api/banners/active").permitAll()
                .requestMatchers("/uploads/**","/api/tra-hang/sum-so-luong/**","/api/tra-hang/tinh-trang/**","/api/tra-hang/{id}/complete/**","/api/tra-hang/{id}/reject/**","/api/tra-hang/{id}/approve/**","/api/tra-hang/**","/rest/don-hang/user/{idTaiKhoan}/completed-orders","/rest/ctdh/don-hang/{idDonHang}/spct").permitAll()
            .anyRequest().authenticated())
        // http.formLogin(Customizer.withDefaults()); //xác thực bằng gửi biểu mẫu yêu
        // cầu đăng nhập
        // xác thực mặc định, gửi thông tin đăng nhập được mã hóa đi kèm với request (để
        // có thể test trên postman)
        .httpBasic(Customizer.withDefaults())


//                        .requestMatchers("rest/danh-gia-dich-vu/getAll").permitAll()
//                        .requestMatchers("rest/thuong-hieu/getAll").permitAll()
//                        .requestMatchers("rest/huong-dau/getAll").permitAll()
//                        .requestMatchers("rest/huong-giua/getAll").permitAll()
//                        .requestMatchers("rest/huong-cuoi/getAll").permitAll()
//                        .requestMatchers("rest/phan-hoi/getAll").permitAll()
//                        .requestMatchers("rest/thuong-hieu/getAll").permitAll()
//                        .requestMatchers("rest/ctdh/getAll").permitAll()
//                        còn lại request nào cũng cần xác thực mới cho phép


                // http.formLogin(Customizer.withDefaults()); //xác thực bằng gửi biểu mẫu yêu
                // cầu đăng nhập
                // xác thực mặc định, gửi thông tin đăng nhập được mã hóa đi kèm với request (để
                // có thể test trên postman)
                .httpBasic(Customizer.withDefaults())
                /*
                 * ko lưu trữ phiên nên form đăng nhập ko còn tác dụng (ko cmt lại thì httpBasic
                 * ko hoạt động)
                 * mà sẽ yêu cầu thông tin đăng nhập kèm theo request (dùng httpBasic)
                 */
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                /*
                 * addFilterBefore để dùng bộ lọc jwtFilter trước khi dùng bộ lọc
                 * UsernamePasswordAuthenticationFilter
                 * tức là nếu có jwt thì khỏi xác thực tk mk
                 */
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build(); // chạy phương thức bảo mật
    }



  @Bean
  // định nghĩa phương thức kiểm tra xác thực người dùng có hợp lệ hay ko dựa trên
  // tk mk
  public AuthenticationProvider authenticationProvider() {
    // lấy thông tin tk từ csdl được mapping qua entity Account và so sánh mk
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    /*
     * mỗi khi người dùng nhập mk vào form, mk đó sẽ được băm ra rồi so sánh với mã
     * băm trong csdl, nếu như ko dùng thì sẽ ko băm, thứ được so sánh với mk băm
     * trong
     * csdl là văn bản thuần túy chứ ko phải mk được băm, số vòng băm khác nhau ko
     * ảnh
     * hưởng gì song vẫn nên cùng sd 2^12 (test với postman thì cũng tương tự)
     */
    provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
    provider.setUserDetailsService(userDetailsService);
    return provider;
  }

  @Bean
  // xử lý xác thực (login được hay ko sẽ đưa sang hành động khác nhau)
  // khi khởi động spring tạo ra 1 instance của AuthenticationManager
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
