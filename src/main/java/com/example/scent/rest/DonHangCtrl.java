package com.example.scent.rest;

import com.example.scent.entity.DonHang;

import com.example.scent.service.DonHangSv;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/don-hang")
public class DonHangCtrl {
    final
    DonHangSv dhs;

    public DonHangCtrl(DonHangSv dhs) {
        this.dhs = dhs;
    }

    @GetMapping("/getAll")
    public List<DonHang> getAll() {
        return dhs.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.add(dh);
        return ResponseEntity.ok("ok");
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.update(dh);
        return ResponseEntity.ok("ok");
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { dhs.delete(id);
    }
}
