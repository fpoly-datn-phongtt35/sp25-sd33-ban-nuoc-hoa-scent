package com.example.scent.service;

import com.example.scent.entity.LichSuThaoTac;
import com.example.scent.repo.LichSuThaoTacInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LichSuThaoTacService {
    @Autowired
    LichSuThaoTacInterface lichSuThaoTacInterface;

    public List<LichSuThaoTac> getLichSuThaoTacByMaDonHang(Integer maDonHang) {
        return lichSuThaoTacInterface.findByMaDonHangOrderByThoiGianThaoTacDesc(maDonHang);
    }
    public List<LichSuThaoTac> getAllLichSuThaoTac() {
        return lichSuThaoTacInterface.findAll();
    }
}
