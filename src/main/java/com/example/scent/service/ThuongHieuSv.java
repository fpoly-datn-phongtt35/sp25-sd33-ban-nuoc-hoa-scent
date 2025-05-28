package com.example.scent.service;

import com.example.scent.dto.ThuongHieuWithStatusDTO;
import com.example.scent.entity.ThuongHieu;
import com.example.scent.repo.SanPhamInterface;
import com.example.scent.repo.ThuongHieuInterface;
import com.example.scent.reques.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThuongHieuSv {
    @Autowired
    ThuongHieuInterface thuongHieuRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    SanPhamInterface sanPhamRepository;

    public Page<ThuongHieu> getAllThuongHieu(Pageable pageable) {
        return thuongHieuRepository.findAll(pageable);
    }

    public List<ThuongHieu> getAll() {
        return thuongHieuRepository.findAll();
    }

    // Phương thức trả về Page<ThuongHieuWithStatusDTO>
    public Page<ThuongHieuWithStatusDTO> findAllWithStatusPaged(String searchQuery, Pageable pageable) {
        // Sử dụng phương thức tìm kiếm nếu có searchQuery
        Page<ThuongHieu> thuongHieuPage;
        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            thuongHieuPage = thuongHieuRepository.searchByMultipleFields(searchQuery, pageable);
        } else {
            thuongHieuPage = thuongHieuRepository.findAll(pageable);
        }

        List<ThuongHieuWithStatusDTO> dtos = thuongHieuPage.getContent().stream().map(thuongHieu -> {
            boolean hasProduct = thuongHieuRepository.existsSanPhamByThuongHieuId(thuongHieu.getId());
            Long soLuongSanPham = thuongHieuRepository.countSanPhamByThuongHieuId(thuongHieu.getId());
            // Sử dụng existsSanPhamWithTrangThai2ByThuongHieuId để tính canRestore
            boolean canRestore = thuongHieuRepository.existsSanPhamWithTrangThai2ByThuongHieuId(thuongHieu.getId());

            return new ThuongHieuWithStatusDTO(
                    thuongHieu.getId(),
                    thuongHieu.getTenThuongHieu(),
                    thuongHieu.getQuocGia(),
                    thuongHieu.getMoTa(),
                    hasProduct,
                    soLuongSanPham,
                    canRestore
            );
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, thuongHieuPage.getTotalElements());
    }

    public ThuongHieu createThuongHieu(ThuongHieu thuongHieu) {
        // Kiểm tra các trường bắt buộc
        if (thuongHieu.getTenThuongHieu() == null || thuongHieu.getTenThuongHieu().trim().isEmpty()) {
            throw new CustomException("Tên thương hiệu không được để trống!", HttpStatus.BAD_REQUEST, "VALIDATION_EMPTY_NAME");
        }
        if (thuongHieu.getQuocGia() == null || thuongHieu.getQuocGia().trim().isEmpty()) {
            throw new CustomException("Quốc gia không được để trống!", HttpStatus.BAD_REQUEST, "VALIDATION_EMPTY_COUNTRY");
        }
        if (thuongHieu.getMoTa() == null || thuongHieu.getMoTa().trim().isEmpty()) {
            throw new CustomException("Mô tả không được để trống!", HttpStatus.BAD_REQUEST, "VALIDATION_EMPTY_DESCRIPTION");
        }

        // Kiểm tra tên thương hiệu đã tồn tại
        if (thuongHieuRepository.existsByTenThuongHieuIgnoreCase(thuongHieu.getTenThuongHieu())) {
            throw new CustomException("Tên thương hiệu đã tồn tại!", HttpStatus.BAD_REQUEST, "DUPLICATE_NAME");
        }

        return thuongHieuRepository.save(thuongHieu);
    }

    // Read (Get all)
    public List<ThuongHieu> getAllThuongHieu() {
        return thuongHieuRepository.findAll();
    }

    // Read (Get by ID)
    public ThuongHieuWithStatusDTO getThuongHieuById(Integer id) {
        ThuongHieu thuongHieu = thuongHieuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thương hiệu với ID: " + id));
        boolean hasProduct = thuongHieuRepository.existsSanPhamByThuongHieuId(thuongHieu.getId());
        Long soLuongSanPham = thuongHieuRepository.countSanPhamByThuongHieuId(thuongHieu.getId());
        boolean canRestore = thuongHieuRepository.existsSanPhamWithTrangThai2ByThuongHieuId(thuongHieu.getId());

        return new ThuongHieuWithStatusDTO(
                thuongHieu.getId(),
                thuongHieu.getTenThuongHieu(),
                thuongHieu.getQuocGia(),
                thuongHieu.getMoTa(),
                hasProduct,
                soLuongSanPham,
                canRestore
        );
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
        boolean hasProduct = thuongHieuRepository.existsSanPhamByThuongHieuId(id);
        if (hasProduct) {
            throw new IllegalStateException("Không thể xóa thương hiệu vì vẫn còn sản phẩm liên kết!");
        }
        thuongHieuRepository.deleteById(id);
    }

    // Ngừng bán sản phẩm theo thương hiệu
    public void deactivateSanPhamByThuongHieuId(Integer thuongHieuId) {
        if (thuongHieuId == null) {
            throw new IllegalArgumentException("ID thương hiệu không được null");
        }
        sanPhamRepository.updateTrangThaiToDeactivatedByThuongHieuId(thuongHieuId);
    }

    // Khôi phục sản phẩm theo thương hiệu
    public void restoreSanPhamByThuongHieuId(Integer thuongHieuId) {
        if (thuongHieuId == null) {
            throw new IllegalArgumentException("ID thương hiệu không được null");
        }
        sanPhamRepository.updateTrangThaiToActiveByThuongHieuId(thuongHieuId);
    }
}