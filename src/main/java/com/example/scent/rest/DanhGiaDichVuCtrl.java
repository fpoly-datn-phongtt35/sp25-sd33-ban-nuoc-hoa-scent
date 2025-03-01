package com.example.scent.rest;

import com.example.scent.entity.DanhGiaDichVu;
import com.example.scent.service.DanhGiaDichVuSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/danh-gia-dich-vu")
public class DanhGiaDichVuCtrl {

    @Autowired
    DanhGiaDichVuSv danhGiaDichVuSv;

    public DanhGiaDichVuCtrl(DanhGiaDichVuSv danhGiaDichVuSv) {
        this.danhGiaDichVuSv = danhGiaDichVuSv;
    }

    @GetMapping("/getAll")
    public List<DanhGiaDichVu> getAll() {
        return danhGiaDichVuSv.getAll();
    }

    @PostMapping("/add")
    public DanhGiaDichVu create(@RequestBody DanhGiaDichVu danhGiaDichVu) {
        return danhGiaDichVuSv.add(danhGiaDichVu);
    }

    @PutMapping("/update")
    public DanhGiaDichVu update(@RequestBody DanhGiaDichVu danhGiaDichVu) {
        return danhGiaDichVuSv.update(danhGiaDichVu);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) {
        danhGiaDichVuSv.delete(id);
    }

}
