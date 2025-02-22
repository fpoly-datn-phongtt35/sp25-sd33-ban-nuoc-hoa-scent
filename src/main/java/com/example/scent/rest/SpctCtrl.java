package com.example.scent.rest;

import com.example.scent.entity.Spct;

import com.example.scent.service.SpctSv;
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
@RequestMapping("/rest/spct")
public class SpctCtrl {
    final
    SpctSv spcts;

    public SpctCtrl(SpctSv spcts) {
        this.spcts = spcts;
    }

    @GetMapping("/getAll")
    public List<Spct> getAll() {
        return spcts.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody Spct spct, BindingResult result) {

        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        spcts.add(spct);
        return ResponseEntity.ok("ok");
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody Spct spct, BindingResult result) {

        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);

        }
        spcts.update(spct);
        return ResponseEntity.ok("ok");
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { spcts.delete(id);
    }
    @GetMapping("/getByidSanPham/{id}")
    public List<Spct> findByidSanPham(@PathVariable Integer id){
        return spcts.findByidSanPham(id);
    }
}


