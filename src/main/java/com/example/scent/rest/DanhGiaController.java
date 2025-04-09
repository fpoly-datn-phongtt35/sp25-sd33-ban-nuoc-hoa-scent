package com.example.scent.rest;
import com.example.scent.dto.DanhGiaDTO;
import com.example.scent.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
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

    // Thêm đánh giá mới
    @PostMapping
    public ResponseEntity<Map<String, Object>> addDanhGia(@RequestBody DanhGiaDTO danhGiaDTO) {
        DanhGiaDTO savedDanhGia = danhGiaService.addDanhGia(danhGiaDTO);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đánh giá đã được thêm thành công!");
        response.put("danhGia", savedDanhGia);
        return ResponseEntity.ok(response);
    }
}
