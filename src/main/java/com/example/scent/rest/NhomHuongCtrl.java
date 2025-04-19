package com.example.scent.rest;

import com.example.scent.entity.NhomHuong;
import com.example.scent.service.NhomHuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Min;

import java.util.List;

@RestController
@RequestMapping("/rest/nhom-huong")
@CrossOrigin("*")
public class NhomHuongCtrl {
    @Autowired
    private NhomHuongService nhomHuongService;

    // Existing: Get all NhomHuong without pagination
    @GetMapping
    public List<NhomHuong> getAll() {
        return nhomHuongService.findAll();
    }

    // New: Get all NhomHuong with pagination
    @GetMapping("/paged")
    public Page<NhomHuong> getAllPaged(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        if (size < 1) {
            size = 10; // Fallback to default size
        }
        return nhomHuongService.findAllPaged(page, size);
    }


    // Existing: Get NhomHuong by ID
    @GetMapping("/{id}")
    public ResponseEntity<NhomHuong> getById(@PathVariable Integer id) {
        return nhomHuongService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Existing: Create new NhomHuong
    @PostMapping
    public ResponseEntity<NhomHuong> create(@RequestBody NhomHuong nhomHuong) {
        return ResponseEntity.ok(nhomHuongService.save(nhomHuong));
    }

    // Existing: Update NhomHuong
    @PutMapping("/{id}")
    public ResponseEntity<NhomHuong> update(@PathVariable Integer id, @RequestBody NhomHuong nhomHuong) {
        return nhomHuongService.findById(id)
                .map(existing -> {
                    existing.setTenNhomHuong(nhomHuong.getTenNhomHuong());
                    existing.setMota(nhomHuong.getMota());
                    return ResponseEntity.ok(nhomHuongService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Existing: Delete NhomHuong
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (nhomHuongService.findById(id).isPresent()) {
            nhomHuongService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}