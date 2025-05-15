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
            @RequestParam(value = "idTaiKhoan", required = false) Integer id) {
        try {
            PhieuGiamGia phieuGiamGia = pggs.getDiscountCodeDetails(code, sdt, id);
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
        }}
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
}

