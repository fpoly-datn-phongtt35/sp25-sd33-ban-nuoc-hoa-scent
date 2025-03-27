package com.example.scent.rest;

import com.example.scent.dto.SpctDTO;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;

import com.example.scent.service.SpctSv;
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
    public Spct create( @RequestBody SpctDTO spctDTO) {
        Spct spct = new Spct();
        spct.setDonGia(spctDTO.getDonGia());
        spct.setSoLuongTonKho(spctDTO.getSoLuongTonKho());
        spct.setDungTich(spctDTO.getDungTich());
        SanPham sanPham = new SanPham();
        sanPham.setIdSanPham(spctDTO.getIdSanPham());
        spct.setSanPham(sanPham);spcts.add(spct);
        return spcts.add(spct);
    }
    @PutMapping("/update")
    public Spct update(@RequestBody SpctDTO spctDTO) {
        System.out.println(spctDTO);
        Spct spct = new Spct();
        spct.setIdSpct(spctDTO.getIdSpct());
        spct.setDonGia(spctDTO.getDonGia());
        spct.setSoLuongTonKho(spctDTO.getSoLuongTonKho());
        spct.setDungTich(spctDTO.getDungTich());
        SanPham sanPham = new SanPham();
        sanPham.setIdSanPham(spctDTO.getIdSanPham());
        spct.setSanPham(sanPham);spcts.add(spct);
        return spcts.update(spct);
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { spcts.delete(id);
    }
    @GetMapping("/getByidSanPham/{id}")
    public List<Spct> findByidSanPham(@PathVariable Integer id){
        return spcts.findByidSanPham(id);
    }
}


