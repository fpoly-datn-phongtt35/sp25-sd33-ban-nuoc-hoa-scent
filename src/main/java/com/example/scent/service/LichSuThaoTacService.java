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
    public void ghiLogThaoTac(Integer maDonHang, Integer taiKhoanId, String tenTaiKhoan,
                              String thaoTac, Integer trangThaiCu, Integer trangThaiMoi, String ghiChu) {
        LichSuThaoTac log = new LichSuThaoTac();
        log.setMaDonHang(maDonHang);
        log.setTaiKhoanId(taiKhoanId);
        log.setTenTaiKhoan(tenTaiKhoan);
        log.setThaoTac(thaoTac);
        log.setTrangThaiCu(trangThaiCu);
        log.setTrangThaiMoi(trangThaiMoi);
        log.setGhiChu(ghiChu);
        log.setThoiGianThaoTac(LocalDateTime.now());
        System.out.println("Ghi log: " + maDonHang + log.toString()); // Thêm log để kiểm tra
        lichSuThaoTacInterface.save(log);
    }
    public List<LichSuThaoTac> getLichSuByMaDonHang(Integer maDonHang) {
        List<LichSuThaoTac> lichSu = lichSuThaoTacInterface.findByMaDonHang(maDonHang);
        System.out.println("Lịch sử cho đơn hàng " + maDonHang + ": " + lichSu);
        return lichSu;
    }
}
