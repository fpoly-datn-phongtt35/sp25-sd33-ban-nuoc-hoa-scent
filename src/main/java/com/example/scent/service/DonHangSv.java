package com.example.scent.service;


import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.entity.DonHang;
import com.example.scent.repo.DonHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonHangSv {
    @Autowired
    DonHangInterface dhi;

    public List<SanPhamThongKeDto> getProductStatistics(Integer year, Integer month){

        int status = 1; // 1 : Đã nhận

        return dhi.getProductStatistics(year, month,status);
    }

    public double getTotalRevenue(Integer year, Integer month) {
        Double totalRevenue = dhi.getTotalRevenue(year, month);
        return totalRevenue != null ? totalRevenue : 0.0;  // Trả về 0 nếu không có kết quả
    }

    public List<DonHang> getAll() {
        return dhi.findAll();
    }


    public DonHang add(DonHang dh) {
        return dhi.save(dh);
    }


    public DonHang update(DonHang dh) {
        return dhi.save(dh);
    }


    public void delete(Integer id) {
        dhi.deleteById(id);
    }


    public DonHang detail(Integer id) {
        return dhi.findById(id).get();
    }
}
