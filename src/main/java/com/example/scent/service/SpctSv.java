package com.example.scent.service;


import com.example.scent.entity.Spct;
import com.example.scent.repo.SpctInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpctSv {
    @Autowired
    SpctInterface spcti;


    public List<Spct> getAll() {
        return spcti.findAll();
    }


    public Spct add(Spct spct) {
        return spcti.save(spct);
    }


    public Spct update(Spct spct) {
        return spcti.save(spct);
    }


    public void delete(Integer id) {
        spcti.deleteById(id);
    }


    public Spct detail(Integer id) {
        return spcti.findById(id).get();
    }
    public List<Spct> findByidSanPham(Integer id_san_pham){
        return spcti.findByidSanPham(id_san_pham);
    }
        public void deleteAllSpct(List<Integer> spctsId) {
            spcti.deleteAllById(spctsId);
        }
        public Spct updateTrangThai(Integer id, Integer trangThai) {
            Spct spct = spcti.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));
            spct.setTrangThai(trangThai);
            return spcti.save(spct);
        }
}
