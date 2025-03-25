package com.example.scent.rest;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamDungTich;
import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.dto.SanPhammDTO;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
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

    @PostMapping("/add")
    public ResponseEntity<?> createSanPham(
            @RequestParam("ten") String tenSanPham,
            @RequestParam("moTa") String moTaSanPham,
            @RequestParam("idThuongHieu") Integer idThuongHieu,
            @RequestParam("idDanhMuc") Integer idDanhMuc,
            @RequestParam("idHuongDau") Integer idHuongDau,
            @RequestParam("idHuongGiua") Integer idHuongGiua,
            @RequestParam("idHuongCuoi") Integer idHuongCuoi,
            @RequestParam(value = "image", required = false) MultipartFile image) {
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
    public ResponseEntity<?> update(@Valid @RequestBody SanPham sp,BindingResult result) {

        if (result.hasErrors()) {

            Map<String, String> errorsMap = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);

        }
        sps.update(sp);
        return ResponseEntity.ok("ok");
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


    @GetMapping("/search")
    public Page<SanPhamInfoDTO> searchSanPham(@RequestParam("searchQuery") String searchQuery,@PageableDefault(size = 12) Pageable pageable) {
        return sps.findBySearchQuery(searchQuery, pageable);
    }
    @GetMapping("/search-price")
    public Page<SanPhamInfoDTO> searchSanPham(

            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12) Pageable pageable) {
        return sps.searchSanPham( minPrice, maxPrice, pageable);
    }

    @GetMapping("/search-danhmuc")
    public Page<SanPhamInfoDTO> getSanPhamByDanhMuc(@RequestParam String tenDanhMuc,@PageableDefault(size = 12) Pageable pageable) {
        return sps.findSanPhamByDanhMuc(tenDanhMuc,pageable);
    }
    @GetMapping("/search-product-on-admin")
    public Page<SanPhammDTO> getSanPhamonAdmin(@RequestParam String keyword, @PageableDefault(size = 12) Pageable pageable) {
        return sps.detailOnAdmin(keyword,pageable);
    }
}


