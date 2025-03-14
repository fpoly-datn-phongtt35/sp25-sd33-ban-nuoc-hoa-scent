package com.example.scent.rest;

import com.example.scent.entity.KhachHang;

import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.service.KhachHangSv;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/khach-hang")
public class KhachHangCtrl {
    final
    KhachHangSv khs;

    public KhachHangCtrl(KhachHangSv khs) {
        this.khs = khs;
    }

    @GetMapping("/getAll")
    public List<KhachHang> getAll() {
        return khs.getAll();
    }

    @PostMapping("/add")
    public KhachHang create(@RequestBody KhachHang kh) {
        return khs.add(kh);
    }

    @PutMapping("/update")
    public KhachHang update(@RequestBody KhachHang kh) {
        return khs.update(kh);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { khs.delete(id);
    }
    @GetMapping("page")
    public Page<KhachHang> getAllKhachHang(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return khs.getPageKhachHang(page, size);
    }
}

