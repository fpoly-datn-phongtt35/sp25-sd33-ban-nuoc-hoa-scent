package com.example.scent.rest;

import com.example.scent.entity.PhieuGiamGia;

import com.example.scent.entity.SanPham;
import com.example.scent.service.PhieuGiamGiaSv;
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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/phieu-giam-gia")
public class PhieuGiamGiaCtrl {
    final
    PhieuGiamGiaSv pggs;

    public PhieuGiamGiaCtrl(PhieuGiamGiaSv pggs) {
        this.pggs = pggs;
    }

    @GetMapping("/getAll")
    public List<PhieuGiamGia> getAll() {
        return pggs.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody PhieuGiamGia pgg, BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        pggs.add(pgg);
        return ResponseEntity.ok(pgg);
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody PhieuGiamGia pgg,BindingResult result) {
        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        pggs.update(pgg);
        return ResponseEntity.ok(pgg);
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { pggs.delete(id);
    }
}

