package com.example.scent.service;

import com.example.scent.dto.SpctDTO;
import com.example.scent.dto.spctDTO2;
import com.example.scent.entity.ChiTietDonHang;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.repo.CTDHInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CTDHSv {
    @Autowired
    CTDHInterface ctdhi;
    public List<spctDTO2> getSpctDetailsByDonHang(Integer idDonHang) {
        return ctdhi.findByDonHangId(idDonHang)
                .stream()
                .map(chiTiet -> {
                    Spct spct = chiTiet.getSpct();
                    SanPham sanPham = spct.getSanPham();
                    return new spctDTO2(
                            spct.getIdSpct(),
                            spct.getDungTich(),
                            spct.getDonGia(),

                            sanPham.getTenSanPham(),
                            sanPham.getIdSanPham()
                    );
                })
                .collect(Collectors.toList());
    }

    public List<ChiTietDonHang> getAll() {
        return ctdhi.findAll();
    }


    public ChiTietDonHang add(ChiTietDonHang ctdh) {
        return ctdhi.save(ctdh);
    }


    public ChiTietDonHang update(ChiTietDonHang ctdh) {
        return ctdhi.save(ctdh);
    }


    public void delete(Integer id) {
        ctdhi.deleteById(id);
    }


    public ChiTietDonHang detail(Integer id) {
        return ctdhi.findById(id).get();
    }
}
