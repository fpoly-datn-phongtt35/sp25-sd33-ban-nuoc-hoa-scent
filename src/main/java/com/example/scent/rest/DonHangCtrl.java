package com.example.scent.rest;

import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.entity.DonHang;

import com.example.scent.service.DonHangSv;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/don-hang")
public class DonHangCtrl {
    final
    DonHangSv dhs;

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
    public ResponseEntity<List<DonHang>> getDonHangChoXuLy() {
        List<DonHang> donHangs = dhs.getDonHangByTrangThai(0);
        return ResponseEntity.ok(donHangs);
    }

    // API lấy danh sách đơn hàng có trạng thái "đang xử lý" (trangThai = 1)
    @GetMapping("/get-don-hang-dang-xu-ly")
    public ResponseEntity<List<DonHang>> getDonHangDangXuLy() {
        List<DonHang> donHangs = dhs.getDonHangByTrangThai(1);
        return ResponseEntity.ok(donHangs);
    }
}
