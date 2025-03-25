package com.example.scent.rest;

import com.example.scent.entity.KhachHang;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.service.KhachHangSv;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/khach-hang")
public class KhachHangCtrl {
    final
    KhachHangSv khs;

    public KhachHangCtrl(KhachHangSv khs) {
        this.khs = khs;
    }

    @GetMapping("/getAll")
    public List<KhachHang> getAll() {
        return khs.getAll();
    }

    @PostMapping("/add")
    public KhachHang create(@RequestBody KhachHang kh) {
        return khs.add(kh);
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody KhachHang kh, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);        }

        khs.update(kh);
        return ResponseEntity.ok(kh);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { khs.delete(id);
    }
    @GetMapping("page")
    public Page<KhachHang> getAllKhachHang(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return khs.getPageKhachHang(page, size);
    }
}

