package com.example.scent.rest;

import com.example.scent.dto.DonHangDTO;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.dto.donhangDTOID;
import com.example.scent.dto.donhangDetailDTO;
import com.example.scent.entity.*;

import com.example.scent.repo.LichSuThaoTacInterface;
import com.example.scent.service.DonHangSv;
import com.example.scent.service.JWTSv;
import com.example.scent.service.LichSuThaoTacService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")

@RestController
@RequestMapping("/rest/don-hang")
public class DonHangCtrl {
    private static final Logger log = LoggerFactory.getLogger(DonHangSv.class);

    final
    DonHangSv dhs;
 @Autowired
 JWTSv jwtSv;
@Autowired
    LichSuThaoTacService lichSuThaoTacService;
 @Autowired
    LichSuThaoTacInterface lichSuThaoTacInterface;
    public DonHangCtrl(DonHangSv dhs) {
        this.dhs = dhs;
    }

    @GetMapping("/statistics")
    public List<SanPhamThongKeDto> getProductStatistics(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        return dhs.getProductStatistics(year, month);
    }

    @GetMapping("/revenue")
    public Double getRevenue(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {

        Double totalRevenue = dhs.getTotalRevenue(year, month);

        return totalRevenue;
    }

    @GetMapping("/getAll")
    public List<DonHang> getAll() {
        return dhs.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.add(dh);
        return ResponseEntity.ok("ok");
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.update(dh);
        return ResponseEntity.ok("ok");
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { dhs.delete(id);
    }

    @PutMapping("/update-trang-thai-dh/{id}")
    public ResponseEntity<String> updateStatusToProcessing(@PathVariable Integer id) {
        dhs.updateTrangThaiDonHang(id);
        return ResponseEntity.ok("Cập nhật trạng thái đơn hàng thành 'Đang xử lý' thành công");
    }
    @GetMapping("/get-don-hang-chua-xu-ly")
    public ResponseEntity<List<DonHang>> getDonHangChoXuLy(Pageable pageable) {
        // Truy vấn danh sách đơn hàng theo trạng thái 0 và phân trang
        List<DonHang> donHangs = dhs.getDonHangByTrangThai( 0);
        return ResponseEntity.ok(donHangs);
    }


    // API lấy danh sách đơn hàng có trạng thái "đang xử lý" (trangThai = 1)
    @GetMapping("/get-don-hang-dang-xu-ly")
    public ResponseEntity<List<DonHang>> getDonHangDangXuLy() {
        List<DonHang> donHangs = dhs.getDonHangByTrangThai(1);
        return ResponseEntity.ok(donHangs);
    }
//    @PostMapping
//    public ResponseEntity<DonHangDTO> createOrder(@RequestBody DonHangDTO orderRequest) {
//        DonHang createdOrder = dhs.createOrder(orderRequest);
//
//        // 🔥 DEBUG: Kiểm tra có hình ảnh không
//
//
//        return ResponseEntity.ok(orderRequest); // ✅ Trả về DonHangDTO (chứa imageURL)
//    }

    @PostMapping
    @Transactional
    public ResponseEntity<DonHang> createOrder(@RequestBody DonHangDTO orderRequest) {
        try{
            DonHang createdOrder = dhs.createOrder(orderRequest);
            return ResponseEntity.ok(createdOrder);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/page")
    public ResponseEntity<List<DonHang>> getDonHangs(
                                                     @RequestParam(required = false, defaultValue = "-1") int trangThai) {
        List<DonHang> donHangs = dhs.getDonHangByStatus(trangThai);
        return ResponseEntity.ok(donHangs);
    }


    @GetMapping("/{id}")
    public ResponseEntity<List<donhangDetailDTO>> getDonHangDetails(@PathVariable Integer id) {
        List<donhangDetailDTO> details = dhs.getDonHangDetailsById(id);
        if (details != null && !details.isEmpty()) {
            return ResponseEntity.ok(details);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

//    @PutMapping("/capnhat-trangthai/{id}")
//    public ResponseEntity<?> capNhatTrangThaiDonHang(@PathVariable Integer id,
//                                                     @RequestParam Integer trangThai,
//                                                     @RequestParam(required = false) String lyDoHuy) {
//        try {
//            // Kiểm tra nếu trạng thái là "Đã Hủy" (trạng thái 5), yêu cầu lý do hủy
//            if (trangThai == 5 && (lyDoHuy == null || lyDoHuy.trim().isEmpty())) {
//                // Nếu lý do hủy không được cung cấp, trả về lỗi
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lý do hủy không thể trống!");
//            }
//
//            // Cập nhật trạng thái đơn hàng
//            DonHang donHang = dhs.capNhatTrangThaiDonHang(id, trangThai, lyDoHuy);
//
//            // Trả về phản hồi thành công với dữ liệu đơn hàng đã cập nhật
//            return ResponseEntity.ok(donHang);
//        } catch (Exception e) {
//            e.printStackTrace();
//            System.err.println("❌ Lỗi cập nhật trạng thái: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
//        }
//    }
    @GetMapping("/user/{idTaiKhoan}")
    public ResponseEntity<List<donhangDTOID>> getDonHangsByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        List<donhangDTOID> donHangs = dhs.getDonHangsByTaiKhoan(idTaiKhoan);

        if (donHangs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(donHangs);
    }

    @PutMapping("/capnhat-tu-dong/{id}")
    public ResponseEntity<?> capNhatTuDongTheoPhuongThuc(@PathVariable Integer id) {
        try {
            DonHang donHang = dhs.detail(id);
            String ptThanhToan = donHang.getPhuongThucThanhToan();
            int trangThaiHienTai = donHang.getTrangThai();
            int trangThaiMoi = trangThaiHienTai;

            boolean isChuyenKhoan = ptThanhToan != null && ptThanhToan.toLowerCase().contains("ck");

            if (trangThaiHienTai == 1 && isChuyenKhoan) {
                trangThaiMoi = 6; // Chuyển khoản → sang "Đã thanh toán"
            } else if (trangThaiHienTai == 1 && !isChuyenKhoan) {
                trangThaiMoi = 2; // Tiền mặt → sang "Đã xác nhận"
            } else if (trangThaiHienTai == 2) {
                trangThaiMoi = 3; // → "Đang giao"
            } else if (trangThaiHienTai == 3) {
                trangThaiMoi = 4; // → "Đã hoàn thành"
            } else if (trangThaiHienTai == 6) {
                trangThaiMoi = 3; // CK: từ "Đã thanh toán" → "Đang giao"
            }

            DonHang updated = dhs.capNhatTrangThaiDonHang(id, trangThaiMoi, null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi cập nhật tự động: " + e.getMessage());
        }
    }


    @PutMapping("/update-trangthai-choxuli/{id}")
    public ResponseEntity<?> updateDonHangInfo(
            @PathVariable Integer id,
            @RequestParam(required = false) String tenNguoiNhanHang,
            @RequestParam(required = false) String diaChiGiaoHang,
            @RequestParam(required = false) String sdtNguoiNhan,
            @RequestParam(required = false) String emailNguoiNhan,
            @RequestParam(required = false) BigDecimal tongTien,
            @RequestParam(required = false) Integer maTinh,
            @RequestParam(required = false) Integer maQuan,
            @RequestParam(required = false) String maPhuong,
            @RequestParam(required = false) BigDecimal phiVanChuyen) {
        try {
            DonHang updatedDonHang = dhs.updateDonHang(id, tenNguoiNhanHang, diaChiGiaoHang, sdtNguoiNhan,
                    emailNguoiNhan, tongTien, maTinh, maQuan, maPhuong, phiVanChuyen);
            return ResponseEntity.ok(updatedDonHang);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PutMapping("/huy/{orderId}")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Integer orderId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isUpdated = dhs.updateOrderStatusToCancelled(orderId);
            if (isUpdated) {
                response.put("status", "success");
                response.put("message", "Đơn hàng đã được huỷ.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Trạng thái không hợp lệ để huỷ.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi trong quá trình xử lý.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @PutMapping("/capnhat-trangthai/{maDonHang}")


    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Integer maDonHang,
            @RequestParam(required = false) String ghiChu,
            @RequestParam(required = false) String lyDoHuy,
            @RequestParam Integer userID,
            @RequestParam String tenDangNhap,
            @RequestParam(required = false) Integer trangThai) {
        Logger logger = LoggerFactory.getLogger(this.getClass());

        try {
            logger.info("API /capnhat-trangthai-ls/{} được gọi bởi tài khoản: userID={}, tenDangNhap={}",
                    maDonHang, userID, tenDangNhap);

            // Kiểm tra userID và tenDangNhap có hợp lệ không
            if (userID == null || tenDangNhap == null || tenDangNhap.trim().isEmpty()) {
                logger.warn("userID hoặc tên đăng nhập không hợp lệ: userID={}, tenDangNhap={}", userID, tenDangNhap);
                return ResponseEntity.status(400).body("userID hoặc tên đăng nhập không hợp lệ");
            }

            // Lấy đơn hàng hiện tại
            DonHang donHang = dhs.detail(maDonHang);
            if (donHang == null) {
                logger.warn("Không tìm thấy đơn hàng với ID: {}", maDonHang);
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng với ID: " + maDonHang);
            }

            // Xác định trạng thái mới
            Integer trangThaiMoi;
            if (trangThai != null) {
                trangThaiMoi = trangThai;
                logger.info("Sử dụng trạng thái được truyền vào: {}", trangThaiMoi);
            } else {
                Integer trangThaiCu = donHang.getTrangThai();
                trangThaiMoi = dhs.tinhTrangThaiMoi(trangThaiCu, donHang.getPhuongThucThanhToan(), lyDoHuy);
                logger.info("Tính trạng thái mới: trangThaiCu={}, trangThaiMoi={}", trangThaiCu, trangThaiMoi);
            }

            // Kiểm tra nếu trạng thái mới là "Đã Hủy" (trạng thái 5), yêu cầu lý do hủy
            if (trangThaiMoi == 5 && (lyDoHuy == null || lyDoHuy.trim().isEmpty())) {
                logger.warn("Lý do hủy không được cung cấp khi trạng thái là Đã Hủy (5)");
                return ResponseEntity.status(400).body("Lý do hủy không thể trống khi hủy đơn hàng!");
            }

            // Cập nhật trạng thái và ghi log
            String ghiChuHuy = (lyDoHuy != null && !lyDoHuy.isEmpty()) ? lyDoHuy : ghiChu;
            if (ghiChuHuy != null && !ghiChuHuy.isEmpty()) {
                donHang.setLyDoHuy(ghiChuHuy);
            }
            logger.info("Cập nhật trạng thái đơn hàng {}: trạng thái mới={}, ghiChuHuy={}, bởi userID={}, tenDangNhap={}",
                    maDonHang, trangThaiMoi, ghiChuHuy, userID, tenDangNhap);
            DonHang updatedDonHang = dhs.capNhatTrangThaiDonHang(maDonHang, trangThaiMoi, userID, tenDangNhap, ghiChuHuy);

            return ResponseEntity.ok(updatedDonHang);
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý cập nhật trạng thái đơn hàng {}: {}", maDonHang, e.getMessage(), e);
            return ResponseEntity.status(500).body("Lỗi khi xử lý: " + e.getMessage());
        }
        // Phương thức phụ để tính trạng thái mới
    }
    @GetMapping("/lichsu/{maDonHang}")
    public ResponseEntity<List<LichSuThaoTac>> getLichSuDonHang(@PathVariable Integer maDonHang) {
        List<LichSuThaoTac> lichSu = lichSuThaoTacInterface.findByMaDonHang(maDonHang);
        return ResponseEntity.ok(lichSu);
    }

    @GetMapping("/lich-su-thao-tac-by-user")
    public ResponseEntity<List<LichSuThaoTac>> getAllLichSuThaoTac() {
        List<LichSuThaoTac> result = lichSuThaoTacService.getAllLichSuThaoTac();
        return ResponseEntity.ok(result);
    }
}
