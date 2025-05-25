package com.example.scent.rest;

import com.example.scent.dto.NotHuongRequestDTO;
import com.example.scent.dto.NotHuongWithStatusDTO;
import com.example.scent.entity.NotHuong;
import com.example.scent.service.NotHuongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/not-huong")
public class NotHuongController {
    @Autowired
    private NotHuongService notHuongService;

    @GetMapping
    public ResponseEntity<Page<NotHuongWithStatusDTO>> getPagedNotHuong(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotHuongWithStatusDTO> notHuongPage = notHuongService.findAllWithStatusPaged(pageable);
        return ResponseEntity.ok(notHuongPage);
    }

    @PostMapping
    public ResponseEntity<NotHuong> addNotHuong(@RequestBody NotHuongRequestDTO notHuongDTO) {
        NotHuong savedNotHuong = notHuongService.save(notHuongDTO);
        return ResponseEntity.ok(savedNotHuong);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotHuong> updateNotHuong(@PathVariable Integer id, @RequestBody NotHuongRequestDTO notHuongDTO) {
        notHuongDTO.setId(id); // Set the ID from the path variable
        NotHuong updatedNotHuong = notHuongService.save(notHuongDTO);
        return ResponseEntity.ok(updatedNotHuong);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotHuong(@PathVariable Integer id) {
        notHuongService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}