package com.example.scent.rest;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.entity.SanPham;
import com.example.scent.service.SanPhamSv;
import org.springframework.http.ResponseEntity;
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

import java.util.List;

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
    public ResponseEntity<?> update(@Valid @RequestBody Spct spct,BindingResult result) {

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
}


