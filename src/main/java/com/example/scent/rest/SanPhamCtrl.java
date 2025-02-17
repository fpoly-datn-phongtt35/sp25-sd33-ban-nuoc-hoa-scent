package com.example.scent.rest;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.entity.SanPham;
import com.example.scent.service.SanPhamSv;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public SanPham create(@RequestBody SanPham sp) {
        return sps.add(sp);
    }

    @PutMapping("/update")
    public SanPham update(@RequestBody SanPham sp) {
        return sps.update(sp);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { sps.delete(id);
    }
    @GetMapping("/detail/{idSanPham}")
    public List<SanPhamDto> detail(@PathVariable Integer idSanPham){
        return sps.detail(idSanPham);
    }
}


