package com.example.scent.rest;
import com.example.scent.dto.DanhGiaDTO;
import com.example.scent.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/danhgia")
public class DanhGiaController {
    @Autowired
    private DanhGiaService danhGiaService;

    // Lấy danh sách đánh giá của một sản phẩm
    @GetMapping("/sanpham/{idSanPham}")
    public ResponseEntity<List<DanhGiaDTO>> getDanhGiaBySanPham(@PathVariable Integer idSanPham) {
        List<DanhGiaDTO> danhGias = danhGiaService.getDanhGiaBySanPham(idSanPham);
        return ResponseEntity.ok(danhGias);
    }
    @GetMapping("/user")
    public ResponseEntity<DanhGiaDTO> getUserDanhGia(
            @RequestParam("productId") Integer idSanPham,
            @RequestParam("userId") Integer idTaiKhoan,
            @RequestParam("orderId") Integer idDonHang) {
        DanhGiaDTO danhGia = danhGiaService.getUserDanhGia(idSanPham, idTaiKhoan, idDonHang);
        if (danhGia == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(danhGia);
    }
    // Thêm đánh giá mới
    @PostMapping
    public ResponseEntity<Map<String, Object>> addDanhGia(@RequestBody DanhGiaDTO danhGiaDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            DanhGiaDTO savedDanhGia = danhGiaService.addDanhGia(danhGiaDTO);
            response.put("message", "Đánh giá đã được thêm thành công!");
            response.put("danhGia", savedDanhGia);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "Có lỗi xảy ra khi thêm đánh giá!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDanhGia(
            @PathVariable Long id,
            @RequestBody DanhGiaDTO danhGiaDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            DanhGiaDTO updatedDanhGia = danhGiaService.updateDanhGia(id, danhGiaDTO);
            response.put("message", "Đánh giá đã được cập nhật thành công!");
            response.put("danhGia", updatedDanhGia);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "Có lỗi xảy ra khi cập nhật đánh giá!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Xóa đánh giá
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDanhGia(
            @PathVariable Long id,
            @RequestParam Integer idTaiKhoan) {
        Map<String, Object> response = new HashMap<>();
        try {
            danhGiaService.deleteDanhGia(id, idTaiKhoan);
            response.put("message", "Đánh giá đã được xóa thành công!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "Có lỗi xảy ra khi xóa đánh giá!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
