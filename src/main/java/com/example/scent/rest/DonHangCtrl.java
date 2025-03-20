package com.example.scent.rest;

import com.example.scent.dto.DonHangDTO;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.dto.donhangDetailDTO;
import com.example.scent.entity.DonHang;

import com.example.scent.entity.TaiKhoan;
import com.example.scent.service.DonHangSv;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<Page<DonHang>> getDonHangChoXuLy(Pageable pageable) {
        // Truy vấn danh sách đơn hàng theo trạng thái 0 và phân trang
        Page<DonHang> donHangs = dhs.getDonHangByTrangThai(pageable, 0);
        return ResponseEntity.ok(donHangs);
    }


    // API lấy danh sách đơn hàng có trạng thái "đang xử lý" (trangThai = 1)
    @GetMapping("/get-don-hang-dang-xu-ly")
    public ResponseEntity<Page<DonHang>> getDonHangDangXuLy(Pageable pageable) {
        Page<DonHang> donHangs = dhs.getDonHangByTrangThai(pageable,1);
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
    public ResponseEntity<DonHang> createOrder(@RequestBody DonHangDTO orderRequest) {
        DonHang createdOrder = dhs.createOrder(orderRequest);
        return ResponseEntity.ok(createdOrder);
    }
    @GetMapping("/page")
    public ResponseEntity<Page<DonHang>> getDonHangs(@RequestParam int page,
                                                     @RequestParam int size,
                                                     @RequestParam(required = false, defaultValue = "-1") int trangThai) {
        Page<DonHang> donHangs = dhs.getPageDonHang(page, size, trangThai);
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

    @PutMapping("/capnhat-trangthai/{id}")
    public ResponseEntity<?> capNhatTrangThaiDonHang(@PathVariable Integer id,
                                                     @RequestParam Integer trangThai,
                                                     @RequestParam(required = false) String lyDoHuy) {
        try {
            // Kiểm tra nếu trạng thái là "Đã Hủy" (trạng thái 5), yêu cầu lý do hủy
            if (trangThai == 5 && (lyDoHuy == null || lyDoHuy.trim().isEmpty())) {
                // Nếu lý do hủy không được cung cấp, trả về lỗi
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lý do hủy không thể trống!");
            }

            // Cập nhật trạng thái đơn hàng
            DonHang donHang = dhs.capNhatTrangThaiDonHang(id, trangThai, lyDoHuy);

            // Trả về phản hồi thành công với dữ liệu đơn hàng đã cập nhật
            return ResponseEntity.ok(donHang);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Lỗi cập nhật trạng thái: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }


}
