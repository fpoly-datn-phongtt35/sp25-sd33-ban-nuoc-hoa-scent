package com.example.scent.service;


import com.example.scent.dto.SanPhamDto;
import com.example.scent.entity.SanPham;
import com.example.scent.repo.SanPhamInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class SanPhamSv {
    @Autowired
    SanPhamInterface spi;


    public List<SanPham> getAll() {
        return spi.findAll();
    }


    public SanPham add(SanPham sanPham) {
        return spi.save(sanPham);
    }


    public SanPham update(SanPham sanPham) {
        return spi.save(sanPham);
    }


    public void delete(Integer id) {
        spi.deleteById(id);
    }


    public List<SanPhamDto> detail(Integer idSanPham) {
        return spi.getDetail(idSanPham);
    }
//    public List<Spct> detail(Integer id){
//        return spi.getAllSpctByIdSp(id);
//    }

//    public List<SanPham> searchByName(String name) {
//        return spi.findByTenContainingIgnoreCase(name);
//    }
}
