    package com.example.scent.service;
    import com.example.scent.dto.SanPhamDto;
    import com.example.scent.dto.SanPhamDungTich;
    import com.example.scent.dto.SanPhamInfoDTO;
    import com.example.scent.dto.SanPhammDTO;
    import com.example.scent.entity.HinhAnh;
    import com.example.scent.entity.SanPham;
    import com.example.scent.repo.HinhAnhInterface;
    import com.example.scent.repo.SanPhamInterface;
    import com.example.scent.repo.DanhMucInterface;
    import com.example.scent.repo.HuongDauInterface;
    import com.example.scent.repo.HuongGiuaInterface;
    import com.example.scent.repo.HuongCuoiInterface;
    import com.example.scent.repo.ThuongHieuInterface;
    import com.example.scent.spec.SanPhamSpec;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.Pageable;
    import org.springframework.http.*;
    import org.springframework.stereotype.Service;
    import org.springframework.util.LinkedMultiValueMap;
    import org.springframework.util.MultiValueMap;
    import org.springframework.web.multipart.MultipartFile;
    import org.springframework.web.client.RestTemplate;


    import java.math.BigDecimal;
    import java.util.Arrays;
    import java.util.Map;
    import java.util.List;
    import java.util.Optional;


    @Service
    public class SanPhamSv {
        @Autowired
        SanPhamInterface spi;

        @Autowired
        HinhAnhInterface hai;

        @Autowired
        private ThuongHieuInterface thuongHieuRepo;

        @Autowired
        private DanhMucInterface danhMucRepo;

        @Autowired
        private HuongDauInterface huongDauRepo;

        @Autowired
        private HuongGiuaInterface huongGiuaRepo;

        @Autowired
        private HuongCuoiInterface huongCuoiRepo;


        public List<SanPham> getAll() {
            return spi.findAll();
        }


        public SanPham add(SanPham sanPham) {
            return spi.save(sanPham);
        }


        public SanPham update(SanPham sanPham) {
            return spi.save(sanPham);
        }


        public void delete(Integer id) {
            spi.deleteById(id);
        }


        public List<SanPhamDto> detail(Integer idSanPham) {
            return spi.getDetail(idSanPham);
        }
    //    public List<Spct> detail(Integer id){
    //        return spi.getAllSpctByIdSp(id);
    //    }


        public List<SanPham> searchByName(String tenSanPham) {
            return spi.searchByName(tenSanPham);
        }
        public List<SanPham> filter(Integer idThuongHieu, Integer idDanhMuc) {
            return spi.findAll(
                    SanPhamSpec.hasThuongHieu(idThuongHieu)
                            .and(SanPhamSpec.hasDanhMuc(idDanhMuc))
            );
        }
        public Page<SanPhamInfoDTO> getAllProductDetails(Pageable pageable) {
            return spi.findAllProductsWithImages(pageable);
        }

        public List<SanPhamInfoDTO> getSortedProducts() {
            return spi.findAllProductsWithImagesSorted();
        }


        public String uploadImageToPostimages(MultipartFile file) {
            String apiUrl = "https://api.imgbb.com/1/upload?key=af27bc3080c57dc57c61576a2e1cdaff";
            RestTemplate restTemplate = new RestTemplate();

            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("image", file.getResource());

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, requestEntity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                    return (data != null && data.containsKey("url")) ? (String) data.get("url") : null;
                }
            } catch (Exception e) {
                System.err.println("Lỗi kết nối ImgBB: " + e.getMessage());
            }
            return null;
        }

        public SanPham updateProductWithDetails(
                Integer idSanPham,
                String tenSanPham, String moTaSanPham, Integer idThuongHieu, Integer idDanhMuc,
                Integer idHuongDau, Integer idHuongGiua, Integer idHuongCuoi, MultipartFile[] images,
                Integer[] idHinhAnhDelete
        ) {

            // Tìm sản phẩm cần cập nhật
            SanPham sanPham = spi.findById(idSanPham)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            // 🧼 Xóa tầng hương cũ
            // Gỡ liên kết cũ
            sanPham.setHuongDau(null);
            sanPham.setHuongGiua(null);
            sanPham.setHuongCuoi(null);
            spi.save(sanPham); // Gỡ khóa ngoại trong DB

            if (sanPham.getHuongDau() != null) {
                huongDauRepo.deleteById(sanPham.getHuongDau().getId());
            }
            if (sanPham.getHuongGiua() != null) {
                huongGiuaRepo.deleteById(sanPham.getHuongGiua().getId());
            }
            if (sanPham.getHuongCuoi() != null) {
                huongCuoiRepo.deleteById(sanPham.getHuongCuoi().getId());
            }
            //Xóa hình ảnh
            if (idHinhAnhDelete != null && idHinhAnhDelete.length > 0) {
                hai.deleteAllById(Arrays.asList(idHinhAnhDelete));
            }
            // Cập nhật thông tin sản phẩm
            sanPham.setTenSanPham(tenSanPham);
            sanPham.setMoTaSanPham(moTaSanPham);
            sanPham.setThuongHieu(thuongHieuRepo.findById(idThuongHieu)
                    .orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại")));
            sanPham.setDanhMuc(danhMucRepo.findById(idDanhMuc)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
            sanPham.setHuongDau(huongDauRepo.findById(idHuongDau).orElse(null));
            sanPham.setHuongGiua(huongGiuaRepo.findById(idHuongGiua).orElse(null));
            sanPham.setHuongCuoi(huongCuoiRepo.findById(idHuongCuoi).orElse(null));

            // Lưu sản phẩm đã cập nhật
            SanPham updatedSanPham = spi.save(sanPham);

            // Kiểm tra nếu có ảnh mới
            if (images != null && images.length > 0) {
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageUrl = uploadImageToPostimages(image);
                        if (imageUrl != null) {
                            HinhAnh hinhAnh = new HinhAnh();
                            hinhAnh.setLink(imageUrl);
                            hinhAnh.setSanPham(updatedSanPham);
                            hai.save(hinhAnh);
                        }
                    }
                }
            }

            return updatedSanPham;
        }

        public SanPham addProductWithDetails(
                String tenSanPham, String moTaSanPham, Integer idThuongHieu, Integer idDanhMuc,
                Integer idHuongDau, Integer idHuongGiua, Integer idHuongCuoi, MultipartFile[] images) {

            SanPham sanPham = new SanPham();
            sanPham.setTenSanPham(tenSanPham);
            sanPham.setMoTaSanPham(moTaSanPham);

            sanPham.setThuongHieu(thuongHieuRepo.findById(idThuongHieu)
                    .orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại")));
            sanPham.setDanhMuc(danhMucRepo.findById(idDanhMuc)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
            sanPham.setHuongDau(huongDauRepo.findById(idHuongDau).orElse(null));
            sanPham.setHuongGiua(huongGiuaRepo.findById(idHuongGiua).orElse(null));
            sanPham.setHuongCuoi(huongCuoiRepo.findById(idHuongCuoi).orElse(null));

            SanPham savedSanPham = spi.save(sanPham);
            int uploadedImages = 0;

            if (images != null && images.length > 0) {
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageUrl = uploadImageToPostimages(image);
                        if (imageUrl != null) {
                            HinhAnh hinhAnh = new HinhAnh();
                            hinhAnh.setLink(imageUrl);
                            hinhAnh.setSanPham(savedSanPham);
                            hai.save(hinhAnh);
                            uploadedImages++;
                        }
                    }
                }
            }

            if (uploadedImages == 0) {
                spi.delete(savedSanPham);
                throw new RuntimeException("Không thể lưu sản phẩm vì tất cả ảnh tải lên đều thất bại.");
            }

            return savedSanPham;
        }

        public List<SanPhamDungTich> getProductVolumesByProductId(Integer productId) {
            return spi.findByIdSanPham(productId);
        }

        public Page<SanPhamInfoDTO> findBySearchQuery(String searchQuery, Pageable pageable) {
            return spi.findBySearchQuery(searchQuery, pageable);
        }
        public Page<SanPhammDTO> detailOnAdmin(String searchQuery, Pageable pageable) {
            return spi.searchAllFields(searchQuery,pageable);
        }

        public Page<SanPhamInfoDTO> searchSanPham( BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
            return spi.searchSanPhamByPrice(minPrice, maxPrice, pageable);
        }

        public Page<SanPhamInfoDTO> findSanPhamByField(String tenDanhMuc, String tenNhomHuong,String tenThuongHieu,String QuocGia, Pageable pageable) {
            // Gọi phương thức trong repository và truyền các tham số cho câu truy vấn
            return spi.findSanPhamByField(tenDanhMuc, tenNhomHuong, tenThuongHieu,QuocGia, pageable);
        }

        public List<HinhAnh> findAllImageBySanPhamId(Integer idSanPham) {
            return hai.findHinhAnhBySanPhamId(idSanPham);
        }

        public Optional<SanPham> findById(Integer id) {
             return spi.findById(id);
        }
    }
