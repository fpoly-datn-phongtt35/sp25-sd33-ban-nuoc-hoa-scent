package com.example.scent.service;

import com.example.scent.dto.NhomHuongWithStatusDTO;
import com.example.scent.entity.NhomHuong;
import com.example.scent.repo.NhomHuongInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NhomHuongService {
    @Autowired
    private NhomHuongInterface nhomHuongRepo;

    // Kiểm tra trạng thái has_product cho từng nhóm hương
    private Integer hasProductForNhomHuong(Integer nhomHuongId) {
        return nhomHuongRepo.existsSanPhamByNhomHuongId(nhomHuongId);
    }

    // Phương thức phân trang trả về Page<NhomHuongWithStatusDTO>
    public Page<NhomHuongWithStatusDTO> findAllWithStatusPaged(Pageable pageable) {
        // Lấy danh sách nhóm hương phân trang
        Page<NhomHuong> nhomHuongPage = nhomHuongRepo.findAll(pageable);

        // Chuyển đổi sang DTO, tính toán trạng thái has_product
        List<NhomHuongWithStatusDTO> dtos = nhomHuongPage.getContent().stream().map(nhomHuong -> {
            Integer hasProduct = hasProductForNhomHuong(nhomHuong.getId());
            return new NhomHuongWithStatusDTO(
                    nhomHuong.getId(),
                    nhomHuong.getTenNhomHuong(),
                    nhomHuong.getMota(),
                    hasProduct
            );
        }).collect(Collectors.toList());

        // Trả về Page chứa danh sách DTO
        return new PageImpl<>(dtos, pageable, nhomHuongPage.getTotalElements());
    }

    public List<NhomHuong> findAll() {
        return nhomHuongRepo.findAll();
    }

    public Optional<NhomHuong> findById(Integer id) {
        return nhomHuongRepo.findById(id);
    }

    public NhomHuong save(NhomHuong nhomHuong) {
        return nhomHuongRepo.save(nhomHuong);
    }

    public void deleteById(Integer id) {
        nhomHuongRepo.deleteById(id);
    }

    public Page<NhomHuong> findAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return nhomHuongRepo.findAll(pageable);
    }
}