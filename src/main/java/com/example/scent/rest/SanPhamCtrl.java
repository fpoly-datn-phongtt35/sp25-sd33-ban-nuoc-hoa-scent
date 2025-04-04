package com.example.scent.rest;

import com.example.scent.dto.*;
import com.example.scent.entity.HinhAnh;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.repo.SanPhamBanChayDto;
import com.example.scent.service.SanPhamSv;
import jakarta.validation.Valid;
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
            @RequestParam("ten") String tenSanPham,
            @RequestParam("moTa") String moTaSanPham,
            @RequestParam("idThuongHieu") Integer idThuongHieu,
            @RequestParam("idDanhMuc") Integer idDanhMuc,
            @RequestParam("idHuongDau") Integer idHuongDau,
            @RequestParam("idHuongGiua") Integer idHuongGiua,
            @RequestParam("idHuongCuoi") Integer idHuongCuoi,
            @RequestParam(value = "image", required = false) MultipartFile[] image) {
        try {
            SanPham savedSanPham = sps.addProductWithDetails(
                    tenSanPham, moTaSanPham, idThuongHieu, idDanhMuc, idHuongDau, idHuongGiua, idHuongCuoi, image
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
            @RequestParam(value = "idHinhAnhDelete",required = false) Integer[] idHinhAnhDelete)
    {
        try {
            SanPham updatedSanPham = sps.updateProductWithDetails(
                    idSanPham, tenSanPham, moTaSanPham, idThuongHieu, idDanhMuc, idHuongDau, idHuongGiua, idHuongCuoi, images
            ,idHinhAnhDelete);
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
    public List<SanPhamDto> detail(@PathVariable Integer idSanPham){
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


