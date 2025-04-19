package com.example.scent.service;


import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.ThuongHieu;
import com.example.scent.repo.ThuongHieuInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ThuongHieuSv {
    @Autowired
    ThuongHieuInterface thuongHieuRepository;
    public Page<ThuongHieu> getAllThuongHieu(Pageable pageable) {
        return thuongHieuRepository.findAll(pageable);
    }
    public List<ThuongHieu> getAll() {
        return thuongHieuRepository.findAll();
    }
    public Page<ThuongHieu> getAllThuongHieu(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return thuongHieuRepository.findAll(pageable);
    }
    // Create
    public ThuongHieu createThuongHieu(ThuongHieu thuongHieu) {
        // Kiểm tra xem tên thương hiệu đã tồn tại chưa
        if (thuongHieuRepository.existsByTenThuongHieuIgnoreCase(thuongHieu.getTenThuongHieu())) {
            throw new IllegalArgumentException("Tên thương hiệu đã tồn tại!");
        }
        return thuongHieuRepository.save(thuongHieu);
    }

    // Read (Get all)
    public List<ThuongHieu> getAllThuongHieu() {
        return thuongHieuRepository.findAll();
    }

    // Read (Get by ID)
    public ThuongHieu getThuongHieuById(Integer id) {
        return thuongHieuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu với ID: " + id));
    }

    // Update
    public ThuongHieu updateThuongHieu(Integer id, ThuongHieu updatedThuongHieu) {
        ThuongHieu existingThuongHieu = thuongHieuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu với ID: " + id));

        // Kiểm tra xem tên thương hiệu mới có trùng với thương hiệu khác không
        if (!existingThuongHieu.getTenThuongHieu().equalsIgnoreCase(updatedThuongHieu.getTenThuongHieu()) &&
                thuongHieuRepository.existsByTenThuongHieuIgnoreCase(updatedThuongHieu.getTenThuongHieu())) {
            throw new IllegalArgumentException("Tên thương hiệu đã tồn tại!");
        }

        existingThuongHieu.setTenThuongHieu(updatedThuongHieu.getTenThuongHieu());
        existingThuongHieu.setQuocGia(updatedThuongHieu.getQuocGia());
        existingThuongHieu.setMoTa(updatedThuongHieu.getMoTa());

        return thuongHieuRepository.save(existingThuongHieu);
    }

    // Delete
    public void deleteThuongHieu(Integer id) {
        if (!thuongHieuRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy thương hiệu với ID: " + id);
        }
        thuongHieuRepository.deleteById(id);
    }
}
