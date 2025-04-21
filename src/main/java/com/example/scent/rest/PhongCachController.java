package com.example.scent.rest;

import com.example.scent.dto.PhongCachWithStatusDTO;
import com.example.scent.entity.PhongCach;
import com.example.scent.service.PhongCachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@CrossOrigin("*")
@RestController
@RequestMapping("/rest/phong-cach")
public class PhongCachController {
    @Autowired
    private PhongCachService phongCachService;

    @GetMapping
    public ResponseEntity<Page<PhongCachWithStatusDTO>> getPagedPhongCach(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PhongCachWithStatusDTO> phongCachPage = phongCachService.findAllWithStatusPaged(pageable);
        return ResponseEntity.ok(phongCachPage);
    }

    @PostMapping
    public ResponseEntity<PhongCach> addPhongCach(@RequestBody PhongCach phongCach) {
        PhongCach savedPhongCach = phongCachService.save(phongCach);
        return ResponseEntity.ok(savedPhongCach);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhongCach> updatePhongCach(@PathVariable Integer id, @RequestBody PhongCach phongCach) {
        phongCach.setId(id);
        PhongCach updatedPhongCach = phongCachService.save(phongCach);
        return ResponseEntity.ok(updatedPhongCach);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhongCach(@PathVariable Integer id) {
        phongCachService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}