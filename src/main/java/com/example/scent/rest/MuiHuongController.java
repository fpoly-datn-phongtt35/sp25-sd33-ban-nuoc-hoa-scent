package com.example.scent.rest;

import com.example.scent.dto.MuiHuongWithStatusDTO;
import com.example.scent.entity.MuiHuong;
import com.example.scent.service.MuiHuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/mui-huong")
public class MuiHuongController {
    @Autowired
    private MuiHuongService muiHuongService;

    @GetMapping
    public ResponseEntity<Page<MuiHuongWithStatusDTO>> getPagedMuiHuong(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MuiHuongWithStatusDTO> muiHuongPage = muiHuongService.findAllWithStatusPaged(pageable);
        return ResponseEntity.ok(muiHuongPage);
    }

    @PostMapping
    public ResponseEntity<MuiHuong> addMuiHuong(@RequestBody MuiHuong muiHuong) {
        MuiHuong savedMuiHuong = muiHuongService.save(muiHuong);
        return ResponseEntity.ok(savedMuiHuong);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MuiHuong> updateMuiHuong(@PathVariable Integer id, @RequestBody MuiHuong muiHuong) {
        muiHuong.setId(id);
        MuiHuong updatedMuiHuong = muiHuongService.save(muiHuong);
        return ResponseEntity.ok(updatedMuiHuong);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMuiHuong(@PathVariable Integer id) {
        muiHuongService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}