package com.example.scent.rest;

import com.example.scent.entity.PhieuGiamGia;

import com.example.scent.entity.SanPham;
import com.example.scent.service.PhieuGiamGiaSv;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    public PhieuGiamGiaCtrl(PhieuGiamGiaSv pggs) {
        this.pggs = pggs;
    }

    @GetMapping("/getAll")
    public List<PhieuGiamGia> getAll() {
        return pggs.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody PhieuGiamGia pgg, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        pggs.add(pgg);
        return ResponseEntity.ok(pgg);
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody PhieuGiamGia pgg,BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        pggs.update(pgg);
        return ResponseEntity.ok(pgg);
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
    @GetMapping("/check")
    public ResponseEntity<?> getDiscountCodeDetails(
            @RequestParam("code") String code,
            @RequestParam(value = "sdt", required = false) String sdt,
            @RequestParam(value = "idTaiKhoan", required = false) Integer id,
            @RequestParam(value = "tongGiaTriDonHang", required = false) BigDecimal tongGiaTriDonHang) {
        try {
            PhieuGiamGia phieuGiamGia = pggs.getDiscountCodeDetails(code, sdt, id, tongGiaTriDonHang);
            return ResponseEntity.ok(phieuGiamGia);
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
            @RequestParam Integer trangThai) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Kiểm tra trạng thái hợp lệ (0 hoặc 1)
            if (trangThai != 0 && trangThai != 1) {
                response.put("status", "error");
                response.put("message", "Trạng thái phải là 0 hoặc 1!");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Lấy phiếu giảm giá
            PhieuGiamGia phieuGiamGia = pggs.detail(id);
            if (phieuGiamGia == null) {
                response.put("status", "error");
                response.put("message", "Phiếu giảm giá không tồn tại!");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            // Lấy thời gian hiện tại
            LocalDateTime currentTime = LocalDateTime.now();
            LocalDateTime startTime = phieuGiamGia.getNgayBatDau();
            LocalDateTime endTime = phieuGiamGia.getNgayHetHan();

            // Kiểm tra nếu đang cố gắng kích hoạt voucher (trangThai = 1)
            if (trangThai == 1) {
                // Nếu thời gian hiện tại nhỏ hơn thời gian bắt đầu
                if (currentTime.isBefore(startTime)) {
                    response.put("status", "error");
                    response.put("message", "Chưa đến thời gian bắt đầu của phiếu giảm giá!");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                // Nếu thời gian hiện tại lớn hơn thời gian hết hạn
                if (currentTime.isAfter(endTime)) {
                    response.put("status", "error");
                    response.put("message", "Phiếu giảm giá đã hết hạn!");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
            }

            // Cập nhật trạng thái
            phieuGiamGia.setTrangThai(trangThai);
            pggs.update(phieuGiamGia);

            response.put("status", "success");
            response.put("message", "Cập nhật trạng thái thành công!");
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
                page,
                size
        );

        return ResponseEntity.ok(response);
    }
}

