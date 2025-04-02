package com.example.scent.rest;

import com.example.scent.entity.NhomHuong;
import com.example.scent.service.NhomHuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/nhom-huong")
@CrossOrigin("*")
public class NhomHuongCtrl {
    @Autowired
    private NhomHuongService nhomHuongService;

    @GetMapping
    public List<NhomHuong> getAll() {
        return nhomHuongService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhomHuong> getById(@PathVariable Integer id) {
        return nhomHuongService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NhomHuong> create(@RequestBody NhomHuong nhomHuong) {
        return ResponseEntity.ok(nhomHuongService.save(nhomHuong));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (nhomHuongService.findById(id).isPresent()) {
            nhomHuongService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
