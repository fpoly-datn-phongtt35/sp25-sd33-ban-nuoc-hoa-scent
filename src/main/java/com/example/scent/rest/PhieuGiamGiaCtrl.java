package com.example.scent.rest;

import com.example.scent.entity.PhieuGiamGia;

import com.example.scent.entity.SanPham;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.PhieuGiamGiaInterface;
import com.example.scent.service.PhieuGiamGiaSv;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/phieu-giam-gia")
public class PhieuGiamGiaCtrl {
    final
    PhieuGiamGiaSv pggs;
@Autowired
private PhieuGiamGiaInterface pggi;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PhieuGiamGiaCtrl.class);
    public PhieuGiamGiaCtrl(PhieuGiamGiaSv pggs) {
        this.pggs = pggs;
    }
    @GetMapping("/users")
    public List<TaiKhoan> getUsers() {
        return pggs.getUsersByRole();
    }

    // Gửi mã giảm giá qua email
    @PostMapping("/send-coupon")
    public Map<String, Object> sendCouponToUser(@RequestParam Integer couponId, @RequestParam Integer userId) {
        return pggs.sendCouponToUser(couponId, userId);
    }
    @GetMapping("/getAll")
    public List<PhieuGiamGia> getAll() {
        return pggs.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody PhieuGiamGia phieuGiamGia, BindingResult result) {
        // Kiểm tra lỗi validation từ @Valid
        if (result.hasErrors()) {
            StringBuilder errorMessage = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                errorMessage.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage.toString());
        }

        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        // Kiểm tra mã giảm giá trùng
        if (pggi.existsByMaGiamGia(phieuGiamGia.getMaGiamGia())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Mã giảm giá đã tồn tại!");
        }
        LocalDateTime now = LocalDateTime.now(); // Thời gian hiện tại: 18/05/2025, 16:22

        // Xác định trạng thái dựa trên thời gian
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (now.isAfter(phieuGiamGia.getNgayBatDau().minusSeconds(1)) &&
                    now.isBefore(phieuGiamGia.getNgayHetHan().plusSeconds(1))) {
                // Nếu thời gian hiện tại nằm trong khoảng [ngayBatDau, ngayHetHan]
                phieuGiamGia.setTrangThai(1); // Hoạt động
            } else {
                // Nếu thời gian hiện tại nằm ngoài khoảng
                phieuGiamGia.setTrangThai(0); // Ngừng
            }
        } else {
            // Nếu không có ngày bắt đầu hoặc ngày kết thúc, mặc định trạng thái là Ngừng
            phieuGiamGia.setTrangThai(0);
        }
        PhieuGiamGia savedVoucher = pggi.save(phieuGiamGia);
        logger.info("Thêm thành công phiếu giảm giá với mã: {}", savedVoucher.getMaGiamGia());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVoucher);
    }

    @PutMapping("/update/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody PhieuGiamGia phieuGiamGia, BindingResult result) {
        logger.info("Cập nhật phiếu giảm giá với ID: {}", id);

        // Kiểm tra lỗi validation từ @Valid
        if (result.hasErrors()) {
            StringBuilder errorMessage = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                errorMessage.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage.toString());
        }

        // Kiểm tra phiếu giảm giá tồn tại
        if (!pggi.existsById(id)) {
            logger.error("Phiếu giảm giá với ID {} không tồn tại!", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Mã giảm giá không tồn tại!");
        }

        // Kiểm tra mã giảm giá trùng, bỏ qua mã của chính voucher đang cập nhật
        if (pggi.existsByMaGiamGiaAndIdNot(phieuGiamGia.getMaGiamGia(), id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Mã giảm giá đã tồn tại!");
        }

        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                logger.error("Ngày bắt đầu {} không được sau ngày kết thúc {}!",
                        phieuGiamGia.getNgayBatDau(), phieuGiamGia.getNgayHetHan());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        PhieuGiamGia existingPhieu = pggi.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phiếu giảm giá không tồn tại!"));

        // Cập nhật trạng thái dựa trên thời gian hiện tại
        LocalDateTime now = LocalDateTime.now(); // Hiện tại: 18/05/2025 16:32 +07
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (existingPhieu.getTrangThai() != 2) { // Chỉ tự động cập nhật nếu không bị tắt thủ công
                if (now.isAfter(phieuGiamGia.getNgayBatDau().minusSeconds(1)) &&
                        now.isBefore(phieuGiamGia.getNgayHetHan().plusSeconds(1))) {
                    // Nếu thời gian hiện tại nằm trong khoảng [ngayBatDau, ngayHetHan]
                    phieuGiamGia.setTrangThai(1); // Hoạt động
                } else {
                    // Nếu thời gian hiện tại nằm ngoài khoảng
                    phieuGiamGia.setTrangThai(0); // Ngừng tự động
                }
            } else {
                // Nếu phiếu giảm giá đã bị tắt thủ công, giữ nguyên trạng thái
                logger.info("Phiếu giảm giá ID: {} đã bị tắt thủ công, giữ nguyên trạng thái: {}", id, existingPhieu.getTrangThai());
                phieuGiamGia.setTrangThai(existingPhieu.getTrangThai()); // Giữ nguyên trạng thái
            }
        } else if (phieuGiamGia.getNgayHetHan() != null) {
            // Nếu chỉ có ngày hết hạn, kiểm tra chỉ với ngày hết hạn
            phieuGiamGia.setTrangThai(phieuGiamGia.getNgayHetHan().isBefore(now) ? 0 : 1);
        } else {
            // Nếu không có ngày bắt đầu hoặc ngày kết thúc, mặc định trạng thái là Ngừng
            logger.warn("Ngày bắt đầu và ngày hết hạn của phiếu giảm giá ID: {} là null, đặt trạng thái Ngừng", id);
            phieuGiamGia.setTrangThai(0);
        }

        logger.info("Phiếu giảm giá ID: {} trạng thái được đặt là: {}", id, phieuGiamGia.getTrangThai());

        // Đặt ID để đảm bảo cập nhật đúng bản ghi
        phieuGiamGia.setId(id);
        PhieuGiamGia updatedVoucher = pggi.save(phieuGiamGia);
        logger.info("Cập nhật thành công phiếu giảm giá với ID: {}, trạng thái: {}",
                updatedVoucher.getId(), updatedVoucher.getTrangThai());
        return ResponseEntity.ok(updatedVoucher);
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { pggs.delete(id);
    }
    @GetMapping("page")
    public Page<PhieuGiamGia> getAllPhieuGiamGia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return pggs.getPagePhieuGiamGia(page, size);
    }
    @GetMapping("/{code}")
    public ResponseEntity<?> getDiscountCodeDetails(@PathVariable String code) {
        Optional<PhieuGiamGia> phieuGiamGia = pggs.getDiscountCodeByCode(code);
        return phieuGiamGia
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    public class DiscountResponse {
        private Double giaTriGiam;
        private Double giaTriToiDa;
        private String ngayBatDau;
        private String ngayHetHan;
        private Integer soLuong;

        // Getters và Setters
        public Double getGiaTriGiam() {
            return giaTriGiam;
        }

        public void setGiaTriGiam(Double giaTriGiam) {
            this.giaTriGiam = giaTriGiam;
        }

        public Double getGiaTriToiDa() {
            return giaTriToiDa;
        }

        public void setGiaTriToiDa(Double giaTriToiDa) {
            this.giaTriToiDa = giaTriToiDa;
        }

        public String getNgayBatDau() {
            return ngayBatDau;
        }

        public void setNgayBatDau(String ngayBatDau) {
            this.ngayBatDau = ngayBatDau;
        }

        public String getNgayHetHan() {
            return ngayHetHan;
        }

        public void setNgayHetHan(String ngayHetHan) {
            this.ngayHetHan = ngayHetHan;
        }

        public Integer getSoLuong() {
            return soLuong;
        }

        public void setSoLuong(Integer soLuong) {
            this.soLuong = soLuong;
        }
    }

    // Sửa phương thức API
    @GetMapping("/check")
    public ResponseEntity<?> getDiscountCodeDetails(
            @RequestParam("code") String code,
            @RequestParam(value = "sdt", required = false) String sdt,
            @RequestParam(value = "idTaiKhoan", required = false) Integer id,
            @RequestParam(value = "tongGiaTriDonHang", required = false) BigDecimal tongGiaTriDonHang) {
        try {
            PhieuGiamGia phieuGiamGia = pggs.getDiscountCodeDetails(code, sdt, id, tongGiaTriDonHang);

            // Chuyển đổi PhieuGiamGia thành DiscountResponse
            DiscountResponse response = new DiscountResponse();
            response.setGiaTriGiam(phieuGiamGia.getGiaTriGiam() != null ? phieuGiamGia.getGiaTriGiam().doubleValue() : null);
            response.setGiaTriToiDa(phieuGiamGia.getGia_tri_toi_da() != null ? phieuGiamGia.getGia_tri_toi_da().doubleValue() : null);
            response.setNgayBatDau(phieuGiamGia.getNgayBatDau() != null ? phieuGiamGia.getNgayBatDau().toString() : null);
            response.setNgayHetHan(phieuGiamGia.getNgayHetHan() != null ? phieuGiamGia.getNgayHetHan().toString() : null);
            response.setSoLuong(phieuGiamGia.getSoLuong());

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                    "status", ex.getStatusCode().value(),
                    "message", ex.getReason()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "message", "Lỗi máy chủ nội bộ, vui lòng thử lại sau!"
            ));
        }
    }
    @PutMapping("/update-status/{id}")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Integer id,
            @RequestParam Integer trangThai,
            @RequestParam(defaultValue = "false") Boolean reset) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Nếu không reset, kiểm tra trạng thái hợp lệ (0 hoặc 1)
            if (!reset && (trangThai != 0 && trangThai != 1)) {
                response.put("status", "error");
                response.put("message", "Trạng thái phải là 0 hoặc 1!");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Lấy phiếu giảm giá
            PhieuGiamGia phieuGiamGia = pggi.findById(id).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "⚠️ Mã giảm giá không tồn tại!"));

            // Kiểm tra nếu đang cố gắng kích hoạt voucher (trangThai = 1) mà không reset
            if (!reset && trangThai == 1) {
                LocalDateTime currentTime = LocalDateTime.now();
                LocalDateTime startTime = phieuGiamGia.getNgayBatDau();
                LocalDateTime endTime = phieuGiamGia.getNgayHetHan();

                if (startTime != null && currentTime.isBefore(startTime)) {
                    response.put("status", "error");
                    response.put("message", "Chưa đến thời gian bắt đầu của phiếu giảm giá!");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                if (endTime != null && currentTime.isAfter(endTime)) {
                    response.put("status", "error");
                    response.put("message", "Phiếu giảm giá đã hết hạn!");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                if (phieuGiamGia.getSoLuong() == 0) {
                    response.put("status", "error");
                    response.put("message", "Số lượng phiếu giảm giá đã hết, không thể kích hoạt!");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
            }

            // Cập nhật trạng thái
            pggs.updateTrangThaiOnly(id, trangThai, reset);

            response.put("status", "success");
            response.put("message", reset ? "Khôi phục trạng thái tự động thành công!" : "Cập nhật trạng thái thành công!");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi khi cập nhật trạng thái: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchVouchers(
            @RequestParam(required = false) String maGiamGia,
            @RequestParam(required = false) Double giaTri,
            @RequestParam(required = false) String ngayBatDau,
            @RequestParam(required = false) String ngayHetHan,
            @RequestParam(required = false) Integer soLuong,
            @RequestParam(required = false) Integer giaTriToiDa,
            @RequestParam(required = false) Integer giaTriToiThieu,
            @RequestParam(required = false) Integer trangThai,
            @RequestParam(required = false) Integer dieuKienapDung, // Thêm tham số dieuKienapDung
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        LocalDateTime startDate = ngayBatDau != null ? LocalDateTime.parse(ngayBatDau) : null;
        LocalDateTime endDate = ngayHetHan != null ? LocalDateTime.parse(ngayHetHan) : null;

        Map<String, Object> response = pggs.searchVouchers(
                maGiamGia,
                giaTri,
                startDate,
                endDate,
                soLuong,
                giaTriToiDa,
                giaTriToiThieu,
                trangThai,
                dieuKienapDung, // Truyền tham số dieuKienapDung vào service

                page,
                size
        );

        return ResponseEntity.ok(response);
    }
}

