package com.example.scent.rest;

import com.example.scent.dto.*;
import com.example.scent.entity.HinhAnh;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.repo.SanPhamBanChayDto;
import com.example.scent.service.SanPhamSv;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/san-pham")
public class SanPhamCtrl {
    final
    SanPhamSv sps;


    public SanPhamCtrl(SanPhamSv sps) {
        this.sps = sps;
    }
    @GetMapping("/search/{tenSanPham}")
    public List<SanPham> search(@PathVariable String tenSanPham){
        return sps.searchByName(tenSanPham);
    }

    @GetMapping("/getAll")
    public List<SanPham> getAll() {
        return sps.getAll();
    }

    @GetMapping("/get-san-pham-ban-chay")
    public List<SanPhamBanChayDto> getSPBanChay() {
        return sps.getSPBanChay();
    }
    @GetMapping("/get-san-pham-ban-it")
    public List<SanPhamBanChayDto> getSPBanIt() {
        return sps.getSPBanIt();
    }
    @GetMapping("/get-san-pham-ton-kho-asc")
    public List<SanPhamTonKhoDTO> getSPTonKhoAsc() {
        return sps.findTop5BySoLuongTonKhoAsc();
    }
    @GetMapping("/get-san-pham-ton-kho-desc")
    public List<SanPhamTonKhoDTO> getSPTonKhoDesc() {
        return sps.findTop5BySoLuongTonKhoDesc();
    }

    @PostMapping("/add")
    public ResponseEntity<?> createSanPham(
            @RequestParam("ten") @NotBlank(message = "Tên sản phẩm không được để trống") String tenSanPham,
            @RequestParam("moTa") String moTaSanPham,
            @RequestParam("idThuongHieu") @NotNull(message = "ID thương hiệu là bắt buộc") Integer idThuongHieu,
            @RequestParam("idDanhMuc") @NotNull(message = "ID danh mục là bắt buộc") Integer idDanhMuc,
            @RequestParam("idNhomHuong") @NotNull(message = "ID nhóm hương là bắt buộc") Integer idNhomHuong,
            @RequestParam(value = "notHuongDauIds") @NotEmpty(message = "Phải có ít nhất một nốt hương đầu") List<Integer> notHuongDauIds,
            @RequestParam(value = "notHuongGiuaIds") @NotEmpty(message = "Phải có ít nhất một nốt hương giữa") List<Integer> notHuongGiuaIds,
            @RequestParam(value = "notHuongCuoiIds") @NotEmpty(message = "Phải có ít nhất một nốt hương cuối") List<Integer> notHuongCuoiIds,
            @RequestParam(value = "phongCachIds") @NotEmpty(message = "Phải có ít nhất một phong cách") List<Integer> phongCachIds,
            @RequestParam(value = "muiHuongSelections") @NotBlank(message = "Mùi hương không được để trống") String muiHuongSelectionsJson,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (muiHuongSelectionsJson == null || muiHuongSelectionsJson.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Danh sách mùi hương không được để trống!");
            }

            // Parse muiHuongSelections từ JSON
            ObjectMapper objectMapper = new ObjectMapper();
            List<MuiHuongSelectionDTO> muiHuongSelections;
            try {
                muiHuongSelections = objectMapper.readValue(
                        muiHuongSelectionsJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, MuiHuongSelectionDTO.class)
                );
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Lỗi khi parse dữ liệu mùi hương: " + e.getMessage());
            }

            // Kiểm tra muiHuongSelections
            if (muiHuongSelections == null || muiHuongSelections.isEmpty()) {
                return ResponseEntity.badRequest().body("Phải có ít nhất một mùi hương!");
            }

            for (MuiHuongSelectionDTO selection : muiHuongSelections) {
                if (selection.getId() == null || selection.getProminenceLevel() == null) {
                    return ResponseEntity.badRequest().body("Dữ liệu mùi hương không hợp lệ: ID và độ nổi hương không được để trống!");
                }
                if (selection.getProminenceLevel() < 0 || selection.getProminenceLevel() > 1) {
                    return ResponseEntity.badRequest().body("Độ nổi hương phải nằm trong khoảng từ 0 đến 1!");
                }
            }

            // Gọi service để lưu sản phẩm
            SanPham savedSanPham = sps.addProductWithDetails(
                    tenSanPham, moTaSanPham, idThuongHieu, idDanhMuc, idNhomHuong,
                    muiHuongSelections, notHuongDauIds, notHuongGiuaIds, notHuongCuoiIds,
                    phongCachIds, images
            );

            return ResponseEntity.ok(savedSanPham);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm sản phẩm: " + e.getMessage());
        }
    }


    @PutMapping("/update")
    public ResponseEntity<?> updateSanPham(
            @RequestParam("idSanPham") Integer idSanPham,
            @RequestParam("ten") String tenSanPham,
            @RequestParam("moTa") String moTaSanPham,
            @RequestParam("idThuongHieu") Integer idThuongHieu,
            @RequestParam("idDanhMuc") Integer idDanhMuc,
            @RequestParam("idHuongDau") Integer idHuongDau,
            @RequestParam("idHuongGiua") Integer idHuongGiua,
            @RequestParam("idHuongCuoi") Integer idHuongCuoi,
            @RequestParam(value = "image", required = false) MultipartFile[] images,
            @RequestParam(value = "idHinhAnhDelete",required = false) Integer[] idHinhAnhDelete,Integer idNhomHuong)
    {
        try {
            SanPham updatedSanPham = sps.updateProductWithDetails(
                    idSanPham, tenSanPham, moTaSanPham, idThuongHieu, idDanhMuc, idHuongDau, idHuongGiua, idHuongCuoi, images
            ,idHinhAnhDelete,idNhomHuong);
            return ResponseEntity.ok(updatedSanPham);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
    }

    @GetMapping("/volums/{productId}")
    public List<SanPhamDungTich> getProductVolumes(@PathVariable Integer productId) {
        return sps.getProductVolumesByProductId(productId);
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { sps.delete(id);
    }
    @GetMapping("/detail/{idSanPham}")
    public List<SanPhamDetailDto> detail(@PathVariable Integer idSanPham){
        return sps.detail(idSanPham);
    }
    @GetMapping("/filter")
    public ResponseEntity<List<SanPham>> filterSanPhams(
            @RequestParam(required = false) Integer idThuongHieu,
            @RequestParam(required = false) Integer idDanhMuc) {
        List<SanPham> sp = sps.filter(idThuongHieu, idDanhMuc);
        return ResponseEntity.ok(sp);
    }

    @GetMapping("/All")
    public ResponseEntity<Page<SanPhamInfoDTO>> getAllProductDetails(@PageableDefault(size = 13) Pageable pageable) {
        Page<SanPhamInfoDTO> productDetails = sps.getAllProductDetails(pageable);
        return ResponseEntity.ok(productDetails);
    }
    @GetMapping("/sorted")
    public List<SanPhamInfoDTO> getSortedProducts() {
        return sps.getSortedProducts();
    }
    @GetMapping("/search-combined")
    public Page<SanPhamInfoDTO> searchSanPhamCombined(
            @RequestParam(value = "searchQuery", required = false) String searchQuery,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "tenDanhMuc", required = false) String tenDanhMuc,
            @RequestParam(value = "tenNhomHuong", required = false) String tenNhomHuong,
            @RequestParam(value = "tenThuongHieu", required = false) String tenThuongHieu,
            @RequestParam(value = "quocGia", required = false) String quocGia,
            @PageableDefault(size = 12) Pageable pageable) {

        // Kiểm tra xem tất cả tham số lọc có phải là null hoặc chuỗi rỗng không
        boolean allFiltersEmpty = (searchQuery == null || searchQuery.isEmpty())
                && minPrice == null
                && maxPrice == null
                && (tenDanhMuc == null || tenDanhMuc.isEmpty())
                && (tenNhomHuong == null || tenNhomHuong.isEmpty())
                && (tenThuongHieu == null || tenThuongHieu.isEmpty())
                && (quocGia == null || quocGia.isEmpty());

        // Nếu tất cả tham số lọc đều rỗng, trả về tất cả sản phẩm
        if (allFiltersEmpty) {
            return sps.searchSanPhamCombined(null, null, null, null, null, null, null, pageable);
        }

        // Nếu có ít nhất một tham số hợp lệ, gọi service với các tham số đã lọc
        return sps.searchSanPhamCombined(
                searchQuery != null && !searchQuery.isEmpty() ? searchQuery : null,
                minPrice,
                maxPrice,
                tenDanhMuc != null && !tenDanhMuc.isEmpty() ? tenDanhMuc : null,
                tenNhomHuong != null && !tenNhomHuong.isEmpty() ? tenNhomHuong : null,
                tenThuongHieu != null && !tenThuongHieu.isEmpty() ? tenThuongHieu : null,
                quocGia != null && !quocGia.isEmpty() ? quocGia : null,
                pageable
        );
    }

    @GetMapping("/search-product-on-admin")
    public Page<SanPhammDTO> getSanPhamonAdmin(@RequestParam String keyword, @PageableDefault(size = 12) Pageable pageable) {
        return sps.detailOnAdmin(keyword,pageable);
    }
    @GetMapping("findAllHinhAnhById")
    public List<HinhAnh> findAllHinhAnhById(@RequestParam Integer id) {
        return sps.findAllImageBySanPhamId(id);
    }
    @GetMapping("/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Integer id) {
        Optional<SanPham> sanPham = sps.findById(id);
        if (sanPham.isPresent()) {
            return ResponseEntity.ok(sanPham.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm");
    }

}


