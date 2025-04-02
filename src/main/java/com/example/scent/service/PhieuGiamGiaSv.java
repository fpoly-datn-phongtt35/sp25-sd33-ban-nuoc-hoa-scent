package com.example.scent.service;


import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.repo.PhieuGiamGiaInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PhieuGiamGiaSv {
    @Autowired
    PhieuGiamGiaInterface pggi;


    public List<PhieuGiamGia> getAll() {
        return pggi.findAll();
    }


    public PhieuGiamGia add(PhieuGiamGia phieuGiamGia) {
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        // Kiểm tra các điều kiện khác nếu cần (ví dụ: mã giảm giá không được trùng)
        if (pggi.existsByMaGiamGia(phieuGiamGia.getMaGiamGia())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá đã tồn tại!");
        }
        return pggi.save(phieuGiamGia);
    }


    public PhieuGiamGia update(PhieuGiamGia phieuGiamGia) {
        if (!pggi.existsById(phieuGiamGia.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "⚠️ Mã giảm giá không tồn tại!");
        }

        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }
        return pggi.save(phieuGiamGia);
    }


    public void delete(Integer id) {
        pggi.deleteById(id);
    }
    public Optional<PhieuGiamGia> getDiscountCodeByCode(String code) {
        return pggi.findByMaGiamGia(code);
    }

    public PhieuGiamGia detail(Integer id) {
        return pggi.findById(id).get();
    }
    public Page<PhieuGiamGia> getPagePhieuGiamGia(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pggi.findAll(pageable);
    }
    public Page<PhieuGiamGia> searchByMaGiamGiaAndGiaTriGiam(String maGiamGia, BigDecimal giaTriGiam, Pageable pageable) {
        return pggi.findByMaGiamGiaContainingAndGiaTriGiam(maGiamGia, giaTriGiam, pageable);
    }
}
