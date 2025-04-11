    package com.example.scent.service;
    import com.example.scent.dto.*;
    import com.example.scent.entity.*;
    import com.example.scent.repo.*;
    import com.example.scent.spec.SanPhamSpec;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageImpl;
    import org.springframework.data.domain.Pageable;
    import org.springframework.http.*;
    import org.springframework.stereotype.Service;
    import org.springframework.util.LinkedMultiValueMap;
    import org.springframework.util.MultiValueMap;
    import org.springframework.web.multipart.MultipartFile;
    import org.springframework.web.client.RestTemplate;


    import java.math.BigDecimal;
    import java.util.*;
    import java.util.stream.Collectors;


    @Service
    public class SanPhamSv {
        @Autowired
        SanPhamInterface spi;

        @Autowired
        HinhAnhInterface hai;
        @Autowired
        private NhomHuongInterface nhi;

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

        @Autowired
        private NotHuongInterface notHuongInterface;
        @Autowired
        private PhongCachInterface phongCachInterface;
        @Autowired
        private MuiHuongInterface muiHuongInterface;
        @Autowired
        private SanPhamMuiHuongInterface sanPhamMuiHuongInterface;
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


        public List<SanPhamDetailDto> detail(Integer idSanPham) {
            // Lấy thông tin chi tiết sản phẩm
            List<SanPhamDto> sanPhamDtos = spi.getDetail(idSanPham);
            if (sanPhamDtos.isEmpty()) {
                throw new RuntimeException("Không tìm thấy sản phẩm với ID: " + idSanPham);
            }

            // Lấy danh sách mùi hương
            List<MuiHuongDto> muiHuongs = spi.getMuiHuongsBySanPhamId(idSanPham);

            // Gộp danh sách hình ảnh duy nhất từ tất cả bản ghi SanPhamDto
            Set<String> uniqueImageURLs = new LinkedHashSet<>();
            for (SanPhamDto sanPhamDto : sanPhamDtos) {
                String imageURLs = sanPhamDto.getimageURL();
                if (imageURLs != null) {
                    uniqueImageURLs.addAll(Arrays.asList(imageURLs.split(", ")));
                }
            }
            String finalImageURLs = String.join(", ", uniqueImageURLs);

            // Tạo danh sách SanPhamDetailDto
            List<SanPhamDetailDto> sanPhamDetailDtos = new ArrayList<>();
            for (SanPhamDto sanPhamDto : sanPhamDtos) {
                // Tạo đối tượng SanPhamDetailDto mới
                SanPhamDetailDto detailDto = new SanPhamDetailDto(sanPhamDto, muiHuongs);

                // Gắn danh sách hình ảnh đã gộp
                detailDto.setImageURL(finalImageURLs);

                // Loại bỏ phong cách trùng lặp
                String phongCachs = sanPhamDto.getPhongCachs();
                if (phongCachs != null) {
                    String[] styles = phongCachs.split(", ");
                    phongCachs = String.join(", ", new LinkedHashSet<>(Arrays.asList(styles)));
                    detailDto.setPhongCachs(phongCachs);
                }

                sanPhamDetailDtos.add(detailDto);
            }

            return sanPhamDetailDtos;
        }


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
                Integer[] idHinhAnhDelete, Integer idNhomHuong
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
            sanPham.setNhomHuong(nhi.findById(idNhomHuong).orElse(null));
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
                String tenSanPham, String moTaSanPham, Integer idThuongHieu, Integer idDanhMuc, Integer idNhomHuong,
                List<MuiHuongSelectionDTO> muiHuongSelections,
                List<Integer> notHuongDauIds, List<Integer> notHuongGiuaIds, List<Integer> notHuongCuoiIds,
                List<Integer> phongCachIds, MultipartFile[] images) {

            SanPham sanPham = new SanPham();
            sanPham.setTenSanPham(tenSanPham);
            sanPham.setMoTaSanPham(moTaSanPham);

            sanPham.setThuongHieu(thuongHieuRepo.findById(idThuongHieu)
                    .orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại")));
            sanPham.setDanhMuc(danhMucRepo.findById(idDanhMuc)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
            sanPham.setNhomHuong(nhi.findById(idNhomHuong)
                    .orElseThrow(() -> new RuntimeException("Nhóm hương không tồn tại")));

            // Handle HuongDau, HuongGiua, HuongCuoi (unchanged)
            HuongDau huongDau = new HuongDau();
            if (notHuongDauIds != null && !notHuongDauIds.isEmpty()) {
                huongDau.setNotHuongs(notHuongInterface.findAllById(notHuongDauIds));
            }
            huongDauRepo.save(huongDau);
            sanPham.setHuongDau(huongDau);

            HuongGiua huongGiua = new HuongGiua();
            if (notHuongGiuaIds != null && !notHuongGiuaIds.isEmpty()) {
                huongGiua.setNotHuongs(notHuongInterface.findAllById(notHuongGiuaIds));
            }
            huongGiuaRepo.save(huongGiua);
            sanPham.setHuongGiua(huongGiua);

            HuongCuoi huongCuoi = new HuongCuoi();
            if (notHuongCuoiIds != null && !notHuongCuoiIds.isEmpty()) {
                huongCuoi.setNotHuongs(notHuongInterface.findAllById(notHuongCuoiIds));
            }
            huongCuoiRepo.save(huongCuoi);
            sanPham.setHuongCuoi(huongCuoi);

            sanPham.updateFragranceDescriptions();
            sanPham.setPhongCachs(phongCachInterface.findAllById(phongCachIds));

            SanPham savedSanPham = spi.save(sanPham);

            // Add scents with prominence
            if (muiHuongSelections != null && !muiHuongSelections.isEmpty()) {
                List<SanPhamMuiHuong> sanPhamMuiHuongs = new ArrayList<>();
                for (MuiHuongSelectionDTO selection : muiHuongSelections) {
                    MuiHuong muiHuong = muiHuongInterface.findById(selection.getId())
                            .orElseThrow(() -> new RuntimeException("Mùi hương không tồn tại: " + selection.getId()));
                    SanPhamMuiHuong spmh = new SanPhamMuiHuong();
                    spmh.setId(new SanPhamMuiHuongId(savedSanPham.getIdSanPham(), muiHuong.getId()));
                    spmh.setSanPham(savedSanPham);
                    spmh.setMuiHuong(muiHuong);
                    spmh.setProminence(selection.getProminenceLevel());
                    sanPhamMuiHuongs.add(spmh);
                }
                savedSanPham.setSanPhamMuiHuongs(sanPhamMuiHuongInterface.saveAll(sanPhamMuiHuongs));
            }

            // Handle image uploads (unchanged)
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
        public Page<SanPhammDTO> detailOnAdmin(String keyword, Pageable pageable) {
            // Tìm kiếm sản phẩm theo keyword
            Page<SanPham> sanPhamPage = spi.findByTenContainingIgnoreCase(keyword, pageable);

            // Chuyển đổi từ SanPham sang SanPhammDTO
            List<SanPhammDTO> sanPhammDTOList = sanPhamPage.getContent().stream().map(sanPham -> {
                // Lấy danh sách mùi hương và độ nổi hương
                List<MuiHuongSelectionDTO> muiHuongSelections = sanPham.getSanPhamMuiHuongs() != null
                        ? sanPham.getSanPhamMuiHuongs().stream().map(sanPhamMuiHuong -> {
                    return new MuiHuongSelectionDTO(
                            sanPhamMuiHuong.getMuiHuong().getId(),
                            sanPhamMuiHuong.getMuiHuong().getTenMuiHuong(),
                            sanPhamMuiHuong.getProminence()
                    );
                }).collect(Collectors.toList())
                        : new ArrayList<>();

                // Lấy danh sách nốt hương đầu
                List<NotHuongDTO> huongDau = sanPham.getHuongDau() != null && sanPham.getHuongDau().getNotHuongs() != null
                        ? sanPham.getHuongDau().getNotHuongs().stream().map(notHuong -> {
                    return new NotHuongDTO(
                            notHuong.getId(),
                            notHuong.getTenNotHuong(),
                            notHuong.getMoTa()
                    );
                }).collect(Collectors.toList())
                        : new ArrayList<>();

                // Lấy danh sách nốt hương giữa
                List<NotHuongDTO> huongGiua = sanPham.getHuongGiua() != null && sanPham.getHuongGiua().getNotHuongs() != null
                        ? sanPham.getHuongGiua().getNotHuongs().stream().map(notHuong -> {
                    return new NotHuongDTO(
                            notHuong.getId(),
                            notHuong.getTenNotHuong(),
                            notHuong.getMoTa()
                    );
                }).collect(Collectors.toList())
                        : new ArrayList<>();

                // Lấy danh sách nốt hương cuối
                List<NotHuongDTO> huongCuoi = sanPham.getHuongCuoi() != null && sanPham.getHuongCuoi().getNotHuongs() != null
                        ? sanPham.getHuongCuoi().getNotHuongs().stream().map(notHuong -> {
                    return new NotHuongDTO(
                            notHuong.getId(),
                            notHuong.getTenNotHuong(),
                            notHuong.getMoTa()
                    );
                }).collect(Collectors.toList())
                        : new ArrayList<>();

                // Lấy danh sách phong cách
                List<PhongCachDTO> phongCach = sanPham.getPhongCachs() != null
                        ? sanPham.getPhongCachs().stream().map(phongCachEntity -> {
                    return new PhongCachDTO(
                            phongCachEntity.getId(),
                            phongCachEntity.getTenPhongCach(),
                            phongCachEntity.getMoTa()
                    );
                }).collect(Collectors.toList())
                        : new ArrayList<>();

                // Tính tổng số lượng từ spcts
                Long tongSoLuong = sanPham.getSpcts() != null
                        ? sanPham.getSpcts().stream().mapToLong(Spct::getSoLuongTonKho).sum()
                        : 0L;

                // Lấy imageURL (giả sử lấy ảnh đầu tiên từ danh sách hinh_anh)
                String imageURL = sanPham.getHinhAnhs() != null && !sanPham.getHinhAnhs().isEmpty()
                        ? sanPham.getHinhAnhs().get(0).getLink()
                        : "";

                // Tạo DTO
                return new SanPhammDTO(
                        sanPham.getIdSanPham(),
                        sanPham.getTenSanPham(),
                        imageURL,
                        sanPham.getThuongHieu() != null ? sanPham.getThuongHieu().getTenThuongHieu() : "",
                        sanPham.getDanhMuc() != null ? sanPham.getDanhMuc().getTenDanhMuc() : "",
                        sanPham.getNhomHuong() != null ? sanPham.getNhomHuong().getTenNhomHuong() : "",
                        tongSoLuong,
                        huongDau,
                        huongGiua,
                        huongCuoi,
                        phongCach,
                        muiHuongSelections
                );
            }).collect(Collectors.toList());

            return new PageImpl<>(sanPhammDTOList, pageable, sanPhamPage.getTotalElements());
        }
        public List<HinhAnh> findAllImageBySanPhamId(Integer idSanPham) {
            return hai.findHinhAnhBySanPhamId(idSanPham);
        }

        public Optional<SanPham> findById(Integer id) {
             return spi.findById(id);
        }

        ///
        public Page<SanPhamInfoDTO> searchSanPhamCombined(String searchQuery,
                                                          BigDecimal minPrice,
                                                          BigDecimal maxPrice,
                                                          String tenDanhMuc,
                                                          String tenNhomHuong,
                                                          String tenThuongHieu,
                                                          String quocGia,
                                                          Pageable pageable) {
            return spi.searchSanPhamCombined(searchQuery, minPrice, maxPrice, tenDanhMuc, tenNhomHuong, tenThuongHieu, quocGia, pageable);
        }

        public List<SPTQDTO> getALlSPTQ(String keyword) {
           return spi.getALLSPQT(keyword);
        }

        public List<SanPhamBanChayDto> getSPBanChay() {
            return spi.getTop10SanPhamBanChay();
        }
        public List<SanPhamBanChayDto> getSPBanIt() {
            return spi.getTop10SanPhamBanIt();
        }
        public List<SanPhamTonKhoDTO> findTop5BySoLuongTonKhoDesc() {
            return spi.findTop5BySoLuongTonKhoDesc();
        }
        public List<SanPhamTonKhoDTO> findTop5BySoLuongTonKhoAsc() {
            return spi.findTop5BySoLuongTonKhoAsc();
        }
    }
