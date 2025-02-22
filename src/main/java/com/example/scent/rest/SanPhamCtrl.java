package com.example.scent.rest;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.service.SanPhamSv;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/san-pham")
public class SanPhamCtrl {
    final
    SanPhamSv sps;

    public SanPhamCtrl(SanPhamSv sps) {
        this.sps = sps;
    }
    @GetMapping("/search/{tenSanPham}")
    public List<SanPham> search(@PathVariable String tenSanPham){
        return sps.searchByName(tenSanPham);
    }

    @GetMapping("/getAll")
    public List<SanPham> getAll() {
        return sps.getAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@Valid @RequestBody SanPham sp, BindingResult result) {

        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        sps.add(sp);
        return ResponseEntity.ok("ok");
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody SanPham sp,BindingResult result) {

        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);

        }
        sps.update(sp);
        return ResponseEntity.ok("ok");
    }


    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { sps.delete(id);
    }
    @GetMapping("/detail/{idSanPham}")
    public List<SanPhamDto> detail(@PathVariable Integer idSanPham){
        return sps.detail(idSanPham);
    }
    @GetMapping("/filter")
    public ResponseEntity<List<SanPham>> filterSanPhams(
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) Integer idDanhMuc) {
        List<SanPham> sp = sps.filter(idThuongHieu, idDanhMuc);
        return ResponseEntity.ok(sp);
    }

    @GetMapping("/All")
    public ResponseEntity<Page<SanPhamInfoDTO>> getAllProductDetails(@PageableDefault(size = 13) Pageable pageable) {
        Page<SanPhamInfoDTO> productDetails = sps.getAllProductDetails(pageable);
        return ResponseEntity.ok(productDetails);
    }
    @GetMapping("/sorted")
    public List<SanPhamInfoDTO> getSortedProducts() {
        return sps.getSortedProducts();
    }
}


