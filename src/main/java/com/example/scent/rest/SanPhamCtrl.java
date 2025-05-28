package com.example.scent.rest;

import com.example.scent.dto.*;
import com.example.scent.entity.HinhAnh;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.repo.SanPhamBanChayDto;
import com.example.scent.repo.SanPhamInterface;
import com.example.scent.repo.SpctInterface;
import com.example.scent.service.SanPhamSv;
import com.example.scent.service.SpctSv;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/san-pham")
public class SanPhamCtrl {
    final
    SanPhamSv sps;
    @Autowired
    SpctSv spcts;
    @Autowired
    private SanPhamInterface sanPhamInterface;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
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
            @RequestParam("idNongDo")@NotNull(message = "ID nồng độ là bắt buộc") Integer idNongDo,
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
                    tenSanPham, moTaSanPham, idThuongHieu, idDanhMuc, idNhomHuong,idNongDo,
                    muiHuongSelections, notHuongDauIds, notHuongGiuaIds, notHuongCuoiIds,
                    phongCachIds, images
            );

            return ResponseEntity.ok(savedSanPham);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm sản phẩm: " + e.getMessage());
        }
    }


    @PutMapping(value = "/update", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateSanPham(@ModelAttribute UpdateSanPhamRequestDTO request) {
        try {
            SanPham updatedSanPham = sps.updateProductWithDetails(
                    request.getIdSanPham(),
                    request.getTen(),
                    request.getMoTa(),
                    request.getIdThuongHieu(),
                    request.getIdDanhMuc(),
                    request.getIdNhomHuong(),
                    request.getIdNongDo(),
                    request.getMuiHuongSelections(),
                    request.getNotHuongDauIds(),
                    request.getNotHuongGiuaIds(),
                    request.getNotHuongCuoiIds(),
                    request.getPhongCachIds(),
                    request.getImages(),
                    request.getIdHinhAnhDelete()
            );
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
            @RequestParam(value = "sort", required = false) String sort,
            @PageableDefault(size = 16) Pageable pageable) {
        System.out.println("API called with sort: '" + sort + "'");
        boolean allFiltersEmpty = (searchQuery == null || searchQuery.isEmpty())
                && minPrice == null
                && maxPrice == null
                && (tenDanhMuc == null || tenDanhMuc.isEmpty())
                && (tenNhomHuong == null || tenNhomHuong.isEmpty())
                && (tenThuongHieu == null || tenThuongHieu.isEmpty())
                && (quocGia == null || quocGia.isEmpty());
        System.out.println("allFiltersEmpty: " + allFiltersEmpty);
        if (allFiltersEmpty) {
            System.out.println("All filters empty, calling searchSanPhamCombined with sort: '" + sort + "'");
            return sps.searchSanPhamCombined(null, null, null, null, null, null, null, sort, pageable);
        }
        return sps.searchSanPhamCombined(
                searchQuery != null && !searchQuery.isEmpty() ? searchQuery : null,
                minPrice,
                maxPrice,
                tenDanhMuc != null && !tenDanhMuc.isEmpty() ? tenDanhMuc : null,
                tenNhomHuong != null && !tenNhomHuong.isEmpty() ? tenNhomHuong : null,
                tenThuongHieu != null && !tenThuongHieu.isEmpty() ? tenThuongHieu : null,
                quocGia != null && !quocGia.isEmpty() ? quocGia : null,
                sort,
                pageable
        );
    }

    @GetMapping("/search-product-on-admin")
    public Page<SanPhammDTO> getSanPhamonAdmin(@RequestParam String keyword, @PageableDefault(size = 12) Pageable pageable) {
        return sps.detailOnAdmin(keyword,pageable);
    }
    @GetMapping("/top-selling-products")
    public ResponseEntity<List<SanPhamInfoDTO2>> getTopSellingProducts() {
        List<SanPhamInfoDTO2> topProducts = sps.getTop10SellingProducts();
        return ResponseEntity.ok(topProducts);
    }
    @GetMapping("findAllHinhAnhById")
    public List<HinhAnh> findAllHinhAnhById(@RequestParam Integer id) {
        return sps.findAllImageBySanPhamId(id);
    }
    @GetMapping("/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Integer id) {
        Optional<SanPham> sanPham = sps.findById(id); // `sps` is your service
        if (sanPham.isPresent()) {
            SanPham sp = sanPham.get();
            SanPhamReponseUpdateAdminDTO sanPhamDTO = new SanPhamReponseUpdateAdminDTO();

            // Map basic fields
            sanPhamDTO.setId(sp.getIdSanPham());
            sanPhamDTO.setTenSanPham(sp.getTenSanPham());
            sanPhamDTO.setMoTaSanPham(sp.getMoTaSanPham());

            // Map ThuongHieu, DanhMuc, and NhomHuong IDs
            if (sp.getThuongHieu() != null) {
                sanPhamDTO.setIdThuongHieu(sp.getThuongHieu().getId());
            }
            if (sp.getDanhMuc() != null) {
                sanPhamDTO.setIdDanhMuc(sp.getDanhMuc().getId());
            }
            if (sp.getNhomHuong() != null) {
                sanPhamDTO.setIdNhomHuong(sp.getNhomHuong().getId());
            }if (sp.getNongDo()!= null) {
                sanPhamDTO.setIdNongDo(sp.getNongDo().getId());
            }

            // Map SanPhamMuiHuongs and MuiHuongSelections
            if (sp.getSanPhamMuiHuongs() != null) {
                // Map to sanPhamMuiHuongs (as before)
                List<MuiHuongReponseUpdateDTO> muiHuongDTOs = sp.getSanPhamMuiHuongs().stream()
                        .filter(sanPhamMuiHuong -> sanPhamMuiHuong.getMuiHuong() != null)
                        .map(sanPhamMuiHuong -> {
                            MuiHuongReponseUpdateDTO muiHuongDTO = new MuiHuongReponseUpdateDTO();
                            muiHuongDTO.setId(sanPhamMuiHuong.getMuiHuong().getId());
                            muiHuongDTO.setTenMuiHuong(sanPhamMuiHuong.getMuiHuong().getTenMuiHuong());
                            return muiHuongDTO;
                        }).collect(Collectors.toList());
                sanPhamDTO.setSanPhamMuiHuongs(muiHuongDTOs);

                // Map to muiHuongSelections (for frontend)
                List<MuiHuongSelectionDTO> muiHuongSelections = sp.getSanPhamMuiHuongs().stream()
                        .filter(sanPhamMuiHuong -> sanPhamMuiHuong.getMuiHuong() != null)
                        .map(sanPhamMuiHuong -> {
                            MuiHuongSelectionDTO selectionDTO = new MuiHuongSelectionDTO();
                            selectionDTO.setTenMuiHuong(sanPhamMuiHuong.getMuiHuong().getTenMuiHuong());
                            selectionDTO.setProminenceLevel(sanPhamMuiHuong.getProminence() != null ? sanPhamMuiHuong.getProminence() : 0.5); // Default to 0.5 if null
                            return selectionDTO;
                        }).collect(Collectors.toList());
                sanPhamDTO.setMuiHuongSelections(muiHuongSelections);
            }

            // Map HuongDau and its NotHuongs
            if (sp.getHuongDau() != null) {
                TangHuongDTO huongDauDTO = new TangHuongDTO();
                huongDauDTO.setId(sp.getHuongDau().getId());
                huongDauDTO.setTenHuong(sp.getHuongDau().getMoTaHuongDau());
                if (sp.getHuongDau().getNotHuongs() != null) {
                    List<NotHuongUpdateReponseDTO> notHuongDTOs = sp.getHuongDau().getNotHuongs().stream()
                            .map(notHuong -> {
                                NotHuongUpdateReponseDTO notHuongDTO = new NotHuongUpdateReponseDTO();
                                notHuongDTO.setId(notHuong.getId());
                                notHuongDTO.setTenNotHuong(notHuong.getTenNotHuong());
                                return notHuongDTO;
                            }).collect(Collectors.toList());
                    huongDauDTO.setNotHuongs(notHuongDTOs);
                }
                sanPhamDTO.setHuongDau(huongDauDTO);
            }

            // Map HuongGiua and its NotHuongs
            if (sp.getHuongGiua() != null) {
                TangHuongDTO huongGiuaDTO = new TangHuongDTO();
                huongGiuaDTO.setId(sp.getHuongGiua().getId());
                huongGiuaDTO.setTenHuong(sp.getHuongGiua().getMoTaHuongGiua());
                if (sp.getHuongGiua().getNotHuongs() != null) {
                    List<NotHuongUpdateReponseDTO> notHuongDTOs = sp.getHuongGiua().getNotHuongs().stream()
                            .map(notHuong -> {
                                NotHuongUpdateReponseDTO notHuongDTO = new NotHuongUpdateReponseDTO();
                                notHuongDTO.setId(notHuong.getId());
                                notHuongDTO.setTenNotHuong(notHuong.getTenNotHuong());
                                return notHuongDTO;
                            }).collect(Collectors.toList());
                    huongGiuaDTO.setNotHuongs(notHuongDTOs);
                }
                sanPhamDTO.setHuongGiua(huongGiuaDTO);
            }

            // Map HuongCuoi and its NotHuongs
            if (sp.getHuongCuoi() != null) {
                TangHuongDTO huongCuoiDTO = new TangHuongDTO();
                huongCuoiDTO.setId(sp.getHuongCuoi().getId());
                huongCuoiDTO.setTenHuong(sp.getHuongCuoi().getMoTaHuongCuoi());
                if (sp.getHuongCuoi().getNotHuongs() != null) {
                    List<NotHuongUpdateReponseDTO> notHuongDTOs = sp.getHuongCuoi().getNotHuongs().stream()
                            .map(notHuong -> {
                                NotHuongUpdateReponseDTO notHuongDTO = new NotHuongUpdateReponseDTO();
                                notHuongDTO.setId(notHuong.getId());
                                notHuongDTO.setTenNotHuong(notHuong.getTenNotHuong());
                                return notHuongDTO;
                            }).collect(Collectors.toList());
                    huongCuoiDTO.setNotHuongs(notHuongDTOs);
                }
                sanPhamDTO.setHuongCuoi(huongCuoiDTO);
            }

            // Map PhongCachs
            if (sp.getPhongCachs() != null) {
                List<PhongCachDTO> phongCachDTOs = sp.getPhongCachs().stream()
                        .map(phongCach -> {
                            PhongCachDTO phongCachDTO = new PhongCachDTO();
                            phongCachDTO.setId(phongCach.getId());
                            phongCachDTO.setTenPhongCach(phongCach.getTenPhongCach());
                            phongCachDTO.setMoTa(phongCach.getMoTa());
                            return phongCachDTO;
                        }).collect(Collectors.toList());
                sanPhamDTO.setPhongCachs(phongCachDTOs);
            }

            // Map HinhAnh IDs
            if (sp.getHinhAnhs() != null) {
                List<Integer> idHinhAnhs = sp.getHinhAnhs().stream()
                        .map(hinhAnh -> hinhAnh.getId())
                        .collect(Collectors.toList());
                sanPhamDTO.setIdHinhAnhs(idHinhAnhs);
            }

            return ResponseEntity.ok(sanPhamDTO);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm");
    }
    @PutMapping("/updateTrangThai/{id}")
    public ResponseEntity<SanPham> updateSanPhamTrangThai(
            @PathVariable Integer id,
            @RequestParam("trangThai") Integer trangThai
    ) {
        // Kiểm tra giá trị trangThai
        if (trangThai != 0 && trangThai != 1) {
            return ResponseEntity.badRequest()
                    .body(null); // Có thể thay bằng thông báo lỗi tùy chỉnh
        }

        // Tìm SanPham theo ID
        SanPham sanPham = sanPhamInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Nếu SanPham đang ở trạng thái 2 (dừng do thương hiệu), không cho phép thay đổi
        if (sanPham.getTrangThai() == 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null); // Có thể thay bằng thông báo lỗi: "Sản phẩm đang bị dừng do thương hiệu"
        }

        // Lấy danh sách Spct thuộc SanPham
        List<Spct> listSpct = spcts.findByidSanPham(id);

        // Cập nhật trạng thái của tất cả Spct
        if (trangThai == 0) {
            // Dừng bán: Chuyển tất cả Spct sang trạng thái 0
            for (Spct spct : listSpct) {
                spcts.updateTrangThai(spct.getIdSpct(), 0);
            }
        } else if (trangThai == 1) {
            // Khôi phục: Chuyển tất cả Spct sang trạng thái 1
            for (Spct spct : listSpct) {
                spcts.updateTrangThai(spct.getIdSpct(), 1);
            }
        }

        // Lấy lại SanPham sau khi cập nhật Spct (trạng thái đã được updateTrangThai tự động cập nhật)
        SanPham updatedSanPham = sanPhamInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Gửi thông báo qua WebSocket đến tất cả client
        try {
            messagingTemplate.convertAndSend("/topic/productUpdates",
                    new ProductUpdateMessage(id, trangThai));
        } catch (Exception e) {
            // Log lỗi nếu gửi WebSocket thất bại
            e.printStackTrace();
        }

        return ResponseEntity.ok(updatedSanPham);
    }

// Class để định dạng thông điệp WebSocket
class ProductUpdateMessage {
    private Integer id;
    private Integer trangThai;

    public ProductUpdateMessage(Integer id, Integer trangThai) {
        this.id = id;
        this.trangThai = trangThai;
    }

    // Getters và setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }
}
    @PostMapping("/recommended")
    public ResponseEntity<List<SanPhamDetailDto>> getRecommendedProducts(@RequestBody SanPhamDetailDto currentProduct) {
        try {
            List<SanPhamDetailDto> recommendedProducts = sps.getRecommendedProducts(currentProduct);
            return ResponseEntity.ok(recommendedProducts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }
    @Autowired
    SpctInterface spctInterface;
    @GetMapping("/statuses")
    public Map<Integer, Integer> getMultipleProductStatuses(@RequestParam("idSpcts") String idSpcts) {
        try {
            // Chuyển chuỗi idSpcts (dạng "1,2,3") thành List<Integer>
            List<Integer> idList = Arrays.stream(idSpcts.split(","))
                    .filter(s -> !s.trim().isEmpty()) // Loại bỏ các phần tử rỗng
                    .map(Integer::parseInt) // Chuyển đổi chuỗi thành Integer
                    .collect(Collectors.toList());

            // Tìm tất cả Spct theo danh sách ID
            List<Spct> spcts = spctInterface.findAllById(idList);

            // Tạo Map để lưu idSpct và trạng thái
            Map<Integer, Integer> statusMap = new HashMap<>();
            for (Spct spct : spcts) {
                statusMap.put(spct.getIdSpct(), spct.getTrangThai());
            }

            return statusMap;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Danh sách idSpcts chứa giá trị không hợp lệ: " + idSpcts, e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy trạng thái Spct: " + e.getMessage(), e);
        }
    }
}


