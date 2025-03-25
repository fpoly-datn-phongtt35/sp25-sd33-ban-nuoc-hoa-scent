package com.example.scent.service;


import com.example.scent.entity.KhachHang;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.repo.KhachHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class KhachHangSv {
    @Autowired
    KhachHangInterface khi;



    public List<KhachHang> getAll() {
        return khi.findAll();
    }


    public KhachHang add(KhachHang kh) {
        return khi.save(kh);
    }


    public KhachHang update(KhachHang kh) {
        return khi.save(kh);
    }


    public void delete(Integer id) {
        khi.deleteById(id);
    }


    public KhachHang detail(Integer id) {
        return khi.findById(id).get();
    }
    public Page<KhachHang> getPageKhachHang(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return khi.findAll(pageable);
    }
}

