package com.example.scent.rest;

import com.example.scent.entity.ThuongHieu;
import com.example.scent.service.ThuongHieuSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Page<ThuongHieu>> getAllThuongHieu(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ThuongHieu> thuongHieuPage = thuongHieuService.getAllThuongHieu(pageable);
        return ResponseEntity.ok(thuongHieuPage);
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
}


