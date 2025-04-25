package com.example.scent.rest;

import com.example.scent.dto.ThuongHieuWithStatusDTO;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.ThuongHieu;
import com.example.scent.service.ThuongHieuSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/thuong-hieu")
public class ThuongHieuCtrl {
    @Autowired
    ThuongHieuSv thuongHieuService;
    @GetMapping("/getAll")
    public List<ThuongHieu> getAll() {
        return thuongHieuService.getAll();
    }
    @PostMapping
    public ResponseEntity<ThuongHieu> createThuongHieu(@RequestBody ThuongHieu thuongHieu) {
        ThuongHieu createdThuongHieu = thuongHieuService.createThuongHieu(thuongHieu);
        return ResponseEntity.ok(createdThuongHieu);
    }

    // Read (Get all)
    @GetMapping
    public Page<ThuongHieuWithStatusDTO> getAllThuongHieu(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        if (size < 1) {
            size = 10;
        }
        Pageable pageable = PageRequest.of(page, size);
        return thuongHieuService.findAllWithStatusPaged(pageable);
    }


    // Read (Get by ID)
    @GetMapping("/{id}")
    public ResponseEntity<ThuongHieu> getThuongHieuById(@PathVariable Integer id) {
        ThuongHieu thuongHieu = thuongHieuService.getThuongHieuById(id);
        return ResponseEntity.ok(thuongHieu);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<ThuongHieu> updateThuongHieu(@PathVariable Integer id, @RequestBody ThuongHieu thuongHieu) {
        ThuongHieu updatedThuongHieu = thuongHieuService.updateThuongHieu(id, thuongHieu);
        return ResponseEntity.ok(updatedThuongHieu);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThuongHieu(@PathVariable Integer id) {
        thuongHieuService.deleteThuongHieu(id);
        return ResponseEntity.noContent().build();
    }
    // API cập nhật trạng thái sản phẩm thành 0 theo id thương hiệu
    @PutMapping("/deactivate/thuong-hieu/{id}")
    public ResponseEntity<Map<String, String>> deactivateSanPhamByThuongHieuId(@PathVariable("id") Integer thuongHieuId) {
        try {
            thuongHieuService.deactivateSanPhamByThuongHieuId(thuongHieuId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái sản phẩm thành công cho thương hiệu ID: " + thuongHieuId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    @PutMapping("/restore/thuong-hieu/{id}")
    public ResponseEntity<Map<String, String>> RestoreSanPhamByThuongHieuId(@PathVariable("id") Integer thuongHieuId) {
        try {
            thuongHieuService.restoreSanPhamByThuongHieuId(thuongHieuId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái sản phẩm thành công cho thương hiệu ID: " + thuongHieuId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}


