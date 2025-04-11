    package com.example.scent.service;
    import com.example.scent.dto.*;
    import com.example.scent.entity.*;
    import com.example.scent.repo.*;
    import com.example.scent.spec.SanPhamSpec;
    import org.hibernate.Hibernate;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageImpl;
    import org.springframework.data.domain.Pageable;
    import org.springframework.http.*;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import org.springframework.util.LinkedMultiValueMap;
    import org.springframework.util.MultiValueMap;
    import org.springframework.web.multipart.MultipartFile;
    import org.springframework.web.client.RestTemplate;


    import java.math.BigDecimal;
    import java.util.*;
    import java.util.stream.Collectors;


    @Service
    public class SanPhamSv {
        private static final Logger log = LoggerFactory.getLogger(SanPhamSv.class);
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
        @Transactional(readOnly = true)
        public Page<SanPhammDTO> detailOnAdmin(String keyword, Pageable pageable) {
            // Xử lý keyword null hoặc rỗng
            String searchKeyword = (keyword != null) ? keyword.trim() : "";

            // Truy vấn sản phẩm với phân trang
            Page<SanPham> sanPhamPage = spi.findByTenContainingIgnoreCase(searchKeyword, pageable);

            // Kiểm tra nếu sanPhamPage rỗng
            if (sanPhamPage.isEmpty()) {
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }

            // Ánh xạ từ SanPham sang SanPhammDTO
            List<SanPhammDTO> sanPhammDTOList = sanPhamPage.getContent().stream()
                    .filter(Objects::nonNull) // Loại bỏ các sản phẩm null (nếu có)
                    .map(sanPham -> {
                        try {
                            // Khởi tạo các mối quan hệ LAZY để tránh proxy
                            Hibernate.initialize(sanPham.getSanPhamMuiHuongs());
                            Hibernate.initialize(sanPham.getPhongCachs());
                            Hibernate.initialize(sanPham.getSpcts());
                            Hibernate.initialize(sanPham.getHinhAnhs());

                            // Nếu có mối quan hệ con trong sanPhamMuiHuongs, khởi tạo thêm
                            if (sanPham.getSanPhamMuiHuongs() != null) {
                                sanPham.getSanPhamMuiHuongs().forEach(sanPhamMuiHuong -> {
                                    if (sanPhamMuiHuong != null) {
                                        Hibernate.initialize(sanPhamMuiHuong.getMuiHuong());
                                    }
                                });
                            }

                            // Nếu có mối quan hệ con trong huongDau, huongGiua, huongCuoi, khởi tạo thêm
                            if (sanPham.getHuongDau() != null) {
                                Hibernate.initialize(sanPham.getHuongDau().getNotHuongs());
                            }
                            if (sanPham.getHuongGiua() != null) {
                                Hibernate.initialize(sanPham.getHuongGiua().getNotHuongs());
                            }
                            if (sanPham.getHuongCuoi() != null) {
                                Hibernate.initialize(sanPham.getHuongCuoi().getNotHuongs());
                            }

                            // Danh sách mùi hương
                            List<MuiHuongSelectionDTO> muiHuongSelections = Optional.ofNullable(sanPham.getSanPhamMuiHuongs())
                                    .map(muiHuongs -> muiHuongs.stream()
                                            .filter(Objects::nonNull) // Loại bỏ sanPhamMuiHuong null
                                            .filter(sanPhamMuiHuong -> sanPhamMuiHuong.getMuiHuong() != null) // Loại bỏ nếu muiHuong null
                                            .map(sanPhamMuiHuong -> new MuiHuongSelectionDTO(
                                                    sanPhamMuiHuong.getMuiHuong().getId(),
                                                    sanPhamMuiHuong.getMuiHuong().getTenMuiHuong(),
                                                    sanPhamMuiHuong.getProminence()
                                            ))
                                            .collect(Collectors.toList()))
                                    .orElse(Collections.emptyList());

                            // Nốt hương đầu
                            List<NotHuongDTO> huongDau = Optional.ofNullable(sanPham.getHuongDau())
                                    .map(huong -> Optional.ofNullable(huong.getNotHuongs())
                                            .map(notHuongs -> notHuongs.stream()
                                                    .filter(Objects::nonNull) // Loại bỏ notHuong null
                                                    .map(notHuong -> new NotHuongDTO(
                                                            notHuong.getId(),
                                                            notHuong.getTenNotHuong(),
                                                            notHuong.getMoTa()
                                                    ))
                                                    .collect(Collectors.toList()))
                                            .orElse(Collections.emptyList()))
                                    .orElse(Collections.emptyList());

                            // Nốt hương giữa
                            List<NotHuongDTO> huongGiua = Optional.ofNullable(sanPham.getHuongGiua())
                                    .map(huong -> Optional.ofNullable(huong.getNotHuongs())
                                            .map(notHuongs -> notHuongs.stream()
                                                    .filter(Objects::nonNull) // Loại bỏ notHuong null
                                                    .map(notHuong -> new NotHuongDTO(
                                                            notHuong.getId(),
                                                            notHuong.getTenNotHuong(),
                                                            notHuong.getMoTa()
                                                    ))
                                                    .collect(Collectors.toList()))
                                            .orElse(Collections.emptyList()))
                                    .orElse(Collections.emptyList());

                            // Nốt hương cuối
                            List<NotHuongDTO> huongCuoi = Optional.ofNullable(sanPham.getHuongCuoi())
                                    .map(huong -> Optional.ofNullable(huong.getNotHuongs())
                                            .map(notHuongs -> notHuongs.stream()
                                                    .filter(Objects::nonNull) // Loại bỏ notHuong null
                                                    .map(notHuong -> new NotHuongDTO(
                                                            notHuong.getId(),
                                                            notHuong.getTenNotHuong(),
                                                            notHuong.getMoTa()
                                                    ))
                                                    .collect(Collectors.toList()))
                                            .orElse(Collections.emptyList()))
                                    .orElse(Collections.emptyList());

                            // Phong cách
                            List<PhongCachDTO> phongCach = Optional.ofNullable(sanPham.getPhongCachs())
                                    .map(phongCachs -> phongCachs.stream()
                                            .filter(Objects::nonNull) // Loại bỏ phongCach null
                                            .map(phongCachEntity -> new PhongCachDTO(
                                                    phongCachEntity.getId(),
                                                    phongCachEntity.getTenPhongCach(),
                                                    phongCachEntity.getMoTa()
                                            ))
                                            .collect(Collectors.toList()))
                                    .orElse(Collections.emptyList());

                            // Tổng số lượng
                            long tongSoLuong = Optional.ofNullable(sanPham.getSpcts())
                                    .map(spcts -> spcts.stream()
                                            .filter(Objects::nonNull) // Loại bỏ spct null
                                            .mapToLong(spct -> spct.getSoLuongTonKho() != null ? spct.getSoLuongTonKho() : 0L)
                                            .sum())
                                    .orElse(0L);

                            // URL ảnh
                            String imageURL = Optional.ofNullable(sanPham.getHinhAnhs())
                                    .filter(hinhAnhs -> !hinhAnhs.isEmpty())
                                    .map(hinhAnhs -> hinhAnhs.get(0).getLink())
                                    .orElse("");

                            // Tạo DTO
                            return new SanPhammDTO(
                                    sanPham.getIdSanPham(),
                                    sanPham.getTenSanPham(),
                                    imageURL,
                                    Optional.ofNullable(sanPham.getThuongHieu()).map(ThuongHieu::getTenThuongHieu).orElse(""),
                                    Optional.ofNullable(sanPham.getDanhMuc()).map(DanhMuc::getTenDanhMuc).orElse(""),
                                    Optional.ofNullable(sanPham.getNhomHuong()).map(NhomHuong::getTenNhomHuong).orElse(""),
                                    tongSoLuong,
                                    huongDau,
                                    huongGiua,
                                    huongCuoi,
                                    phongCach,
                                    muiHuongSelections
                            );
                        } catch (Exception e) {
                            // Ghi log lỗi và bỏ qua bản ghi này để tránh phá vỡ toàn bộ trang
                            log.error("Error mapping SanPham with ID {} to DTO: {}", sanPham.getIdSanPham(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull) // Loại bỏ các DTO null (nếu có lỗi ánh xạ)
                    .collect(Collectors.toList());

            // Kiểm tra tính nhất quán
            if (sanPhammDTOList.size() != sanPhamPage.getContent().size()) {
                log.warn("Mismatch between sanPhamPage content size ({}) and sanPhammDTOList size ({})",
                        sanPhamPage.getContent().size(), sanPhammDTOList.size());
            }

            // Trả về PageImpl với dữ liệu đã ánh xạ
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
