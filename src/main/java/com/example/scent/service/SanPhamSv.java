    package com.example.scent.service;
    import com.example.scent.dto.*;
    import com.example.scent.entity.*;
    import com.example.scent.repo.*;
    import com.example.scent.spec.SanPhamSpec;
    import org.hibernate.Hibernate;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.data.domain.*;
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
    import java.util.stream.Stream;


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
        private NongDoInterface ndi;
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
                detailDto.setNongDo(sanPhamDto.getNongDo());
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

        @Transactional
        public SanPham updateProductWithDetails(
                Integer idSanPham,
                String tenSanPham,
                String moTaSanPham,
                Integer idThuongHieu,
                Integer idDanhMuc,
                Integer idNhomHuong,
                Integer idNongDo,
                List<MuiHuongSelectionDTO> muiHuongSelections,
                List<Integer> notHuongDauIds,
                List<Integer> notHuongGiuaIds,
                List<Integer> notHuongCuoiIds,
                List<Integer> phongCachIds,
                MultipartFile[] images,
                Integer[] idHinhAnhDelete
        ) {
            // Tìm sản phẩm cần cập nhật
            SanPham sanPham = spi.findById(idSanPham)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            // Bước 1: Gỡ các tham chiếu khóa ngoại trong bảng san_pham
            // Đặt id_huong_dau, id_huong_giua, id_huong_cuoi thành null
            sanPham.setHuongDau(null);
            sanPham.setHuongGiua(null);
            sanPham.setHuongCuoi(null);
            spi.save(sanPham); // Lưu để gỡ liên kết khóa ngoại

            // Bước 2: Xóa các bản ghi con (HuongDau, HuongGiua, HuongCuoi)
            // Lấy ID của các tầng hương cũ để xóa
            Integer oldHuongDauId = sanPham.getHuongDau() != null ? sanPham.getHuongDau().getId() : null;
            Integer oldHuongGiuaId = sanPham.getHuongGiua() != null ? sanPham.getHuongGiua().getId() : null;
            Integer oldHuongCuoiId = sanPham.getHuongCuoi() != null ? sanPham.getHuongCuoi().getId() : null;

            if (oldHuongDauId != null) {
                huongDauRepo.deleteById(oldHuongDauId);
            }
            if (oldHuongGiuaId != null) {
                huongGiuaRepo.deleteById(oldHuongGiuaId);
            }
            if (oldHuongCuoiId != null) {
                huongCuoiRepo.deleteById(oldHuongCuoiId);
            }

            // Bước 3: Xóa các bản ghi con khác
            // Xóa mùi hương cũ (SanPhamMuiHuong)
            if (sanPham.getSanPhamMuiHuongs() != null && !sanPham.getSanPhamMuiHuongs().isEmpty()) {
                sanPhamMuiHuongInterface.deleteAll(sanPham.getSanPhamMuiHuongs());
                sanPham.setSanPhamMuiHuongs(null);
            }

            // Xóa hình ảnh cũ nếu có
            if (idHinhAnhDelete != null && idHinhAnhDelete.length > 0) {
                hai.deleteAllById(Arrays.asList(idHinhAnhDelete));
            }

            // Bước 4: Cập nhật thông tin cơ bản của sản phẩm
            sanPham.setTenSanPham(tenSanPham);
            sanPham.setMoTaSanPham(moTaSanPham);
            sanPham.setThuongHieu(thuongHieuRepo.findById(idThuongHieu)
                    .orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại")));
            sanPham.setDanhMuc(danhMucRepo.findById(idDanhMuc)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
            sanPham.setNhomHuong(nhi.findById(idNhomHuong)
                    .orElseThrow(() -> new RuntimeException("Nhóm hương không tồn tại")));
            sanPham.setNongDo(ndi.findById(idNongDo)
                    .orElseThrow(() -> new RuntimeException("Nồng độ không tồn tại")));

            // Bước 5: Tạo mới các tầng hương
            if (notHuongDauIds != null && !notHuongDauIds.isEmpty()) {
                HuongDau huongDau = new HuongDau();
                List<NotHuong> notHuongsDau = notHuongInterface.findAllById(notHuongDauIds);
                if (notHuongsDau.size() != notHuongDauIds.size()) {
                    throw new RuntimeException("Một số nốt hương đầu không tồn tại");
                }
                huongDau.setNotHuongs(notHuongsDau);
                huongDauRepo.save(huongDau);
                sanPham.setHuongDau(huongDau);
            }

            if (notHuongGiuaIds != null && !notHuongGiuaIds.isEmpty()) {
                HuongGiua huongGiua = new HuongGiua();
                List<NotHuong> notHuongsGiua = notHuongInterface.findAllById(notHuongGiuaIds);
                if (notHuongsGiua.size() != notHuongGiuaIds.size()) {
                    throw new RuntimeException("Một số nốt hương giữa không tồn tại");
                }
                huongGiua.setNotHuongs(notHuongsGiua);
                huongGiuaRepo.save(huongGiua);
                sanPham.setHuongGiua(huongGiua);
            }

            if (notHuongCuoiIds != null && !notHuongCuoiIds.isEmpty()) {
                HuongCuoi huongCuoi = new HuongCuoi();
                List<NotHuong> notHuongsCuoi = notHuongInterface.findAllById(notHuongCuoiIds);
                if (notHuongsCuoi.size() != notHuongCuoiIds.size()) {
                    throw new RuntimeException("Một số nốt hương cuối không tồn tại");
                }
                huongCuoi.setNotHuongs(notHuongsCuoi);
                huongCuoiRepo.save(huongCuoi);
                sanPham.setHuongCuoi(huongCuoi);
            }

            // Cập nhật mô tả tầng hương
            sanPham.updateFragranceDescriptions();

            // Bước 6: Cập nhật phong cách
            if (phongCachIds != null) {
                List<PhongCach> phongCachs = phongCachInterface.findAllById(phongCachIds);
                if (phongCachs.size() != phongCachIds.size()) {
                    throw new RuntimeException("Một số phong cách không tồn tại");
                }
                sanPham.setPhongCachs(phongCachs);
            } else {
                sanPham.setPhongCachs(new ArrayList<>());
            }

            // Lưu sản phẩm trước khi thêm mùi hương và hình ảnh
            SanPham updatedSanPham = spi.save(sanPham);

            // Bước 7: Cập nhật mùi hương (SanPhamMuiHuong)
            if (muiHuongSelections != null && !muiHuongSelections.isEmpty()) {
                List<SanPhamMuiHuong> sanPhamMuiHuongs = new ArrayList<>();
                for (MuiHuongSelectionDTO selection : muiHuongSelections) {
                    MuiHuong muiHuong = muiHuongInterface.findById(selection.getId())
                            .orElseThrow(() -> new RuntimeException("Mùi hương không tồn tại: " + selection.getId()));
                    SanPhamMuiHuong spmh = new SanPhamMuiHuong();
                    spmh.setId(new SanPhamMuiHuongId(updatedSanPham.getIdSanPham(), muiHuong.getId()));
                    spmh.setSanPham(updatedSanPham);
                    spmh.setMuiHuong(muiHuong);
                    spmh.setProminence(selection.getProminenceLevel());
                    sanPhamMuiHuongs.add(spmh);
                }
                updatedSanPham.setSanPhamMuiHuongs(sanPhamMuiHuongInterface.saveAll(sanPhamMuiHuongs));
            }

            // Bước 8: Xử lý hình ảnh mới
            int uploadedImages = 0;
            if (images != null && images.length > 0) {
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageUrl = uploadImageToPostimages(image);
                        if (imageUrl != null) {
                            HinhAnh hinhAnh = new HinhAnh();
                            hinhAnh.setLink(imageUrl);
                            hinhAnh.setSanPham(updatedSanPham);
                            hai.save(hinhAnh);
                            uploadedImages++;
                        }
                    }
                }
            }

            // Kiểm tra nếu không có ảnh nào được tải lên và cũng không còn ảnh cũ
            List<HinhAnh> remainingImages = hai.findHinhAnhBySanPhamId(updatedSanPham.getIdSanPham());
            if (remainingImages.isEmpty() && uploadedImages == 0) {
                spi.delete(updatedSanPham);
                throw new RuntimeException("Không thể cập nhật sản phẩm vì không có ảnh nào tồn tại.");
            }

            return updatedSanPham;
        }

        public SanPham addProductWithDetails(
                String tenSanPham, String moTaSanPham, Integer idThuongHieu,
                Integer idDanhMuc, Integer idNhomHuong,Integer idNongDo,
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
            sanPham.setNongDo(ndi.findById(idNongDo)
                    .orElseThrow(() -> new RuntimeException("Nồng độ không tồn tại")));
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

                                    muiHuongSelections,sanPham.getTrangThai()

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
        public SanPham updateTrangThai(Integer id, Integer trangThai) {
            SanPham sanPham = spi.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            sanPham.setTrangThai(trangThai);
            return spi.save(sanPham);
        }
        public List<HinhAnh> findAllImageBySanPhamId(Integer idSanPham) {
            return hai.findHinhAnhBySanPhamId(idSanPham);
        }

        public Optional<SanPham> findById(Integer id) {
            Optional<SanPham> sanPham = spi.findById(id);
            sanPham.ifPresent(sp -> {
                // Khởi tạo các mối quan hệ LAZY
                Hibernate.initialize(sp.getSanPhamMuiHuongs());
                if (sp.getSanPhamMuiHuongs() != null) {
                    sp.getSanPhamMuiHuongs().forEach(sanPhamMuiHuong -> {
                        if (sanPhamMuiHuong != null) {
                            Hibernate.initialize(sanPhamMuiHuong.getMuiHuong());
                        }
                    });
                }
                Hibernate.initialize(sp.getHuongDau());
                if (sp.getHuongDau() != null) {
                    Hibernate.initialize(sp.getHuongDau().getNotHuongs());
                }
                Hibernate.initialize(sp.getHuongGiua());
                if (sp.getHuongGiua() != null) {
                    Hibernate.initialize(sp.getHuongGiua().getNotHuongs());
                }
                Hibernate.initialize(sp.getHuongCuoi());
                if (sp.getHuongCuoi() != null) {
                    Hibernate.initialize(sp.getHuongCuoi().getNotHuongs());
                }
                Hibernate.initialize(sp.getPhongCachs());
            });
            return sanPham;
        }

        public Page<SanPhamInfoDTO> searchSanPhamCombined(
                String searchQuery,
                BigDecimal minPrice,
                BigDecimal maxPrice,
                String tenDanhMuc,
                String tenNhomHuong,
                String tenThuongHieu,
                String quocGia,
                String sort,
                Pageable pageable) {

            // Convert empty strings to null
            searchQuery = (searchQuery != null && searchQuery.trim().isEmpty()) ? null : searchQuery;
            tenDanhMuc = (tenDanhMuc != null && tenDanhMuc.trim().isEmpty()) ? null : tenDanhMuc;
            tenNhomHuong = (tenNhomHuong != null && tenNhomHuong.trim().isEmpty()) ? null : tenNhomHuong;
            tenThuongHieu = (tenThuongHieu != null && tenThuongHieu.trim().isEmpty()) ? null : tenThuongHieu;
            quocGia = (quocGia != null && quocGia.trim().isEmpty()) ? null : quocGia;

            // Handle sorting dynamically
            Page<SanPhamInfoDTO> sanPhamPage;
            if (sort != null && !sort.trim().isEmpty()) {
                // Tách sort thành sortField và direction (dạng "field,direction")
                String[] sortParts = sort.split(",");
                String sortField = sortParts[0];
                Sort.Direction direction = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc"))
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

                // Validate sortField to prevent invalid fields
                switch (sortField) {
                    case "tenSanPham":
                    case "donGia":
                    case "createDate":
                        // Create a new Sort object for standard fields
                        Sort sortOrder = Sort.by(direction, sortField);
                        // Override pageable's sort with the new sort order
                        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortOrder);
                        sanPhamPage = spi.searchSanPhamCombined(
                                searchQuery, minPrice, maxPrice, tenDanhMuc,
                                tenNhomHuong, tenThuongHieu, quocGia, pageable);
                        break;
                    case "soLuongBan":
                        // For soLuongBan, use the specific query with ORDER BY
                        // Remove any sort from pageable to prevent Hibernate from appending invalid order by
                        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
                        if (direction == Sort.Direction.DESC) {
                            sanPhamPage = spi.searchSanPhamCombinedByBestSelling(
                                    searchQuery, minPrice, maxPrice, tenDanhMuc,
                                    tenNhomHuong, tenThuongHieu, quocGia, pageable);
                        } else {
                            sanPhamPage = spi.searchSanPhamCombinedByBestSellingAsc(
                                    searchQuery, minPrice, maxPrice, tenDanhMuc,
                                    tenNhomHuong, tenThuongHieu, quocGia, pageable);
                        }
                        break;
                    default:
                        sortField = "idSanPham"; // Default sort field
                        Sort defaultSortOrder = Sort.by(Sort.Direction.ASC, sortField);
                        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSortOrder);
                        sanPhamPage = spi.searchSanPhamCombined(
                                searchQuery, minPrice, maxPrice, tenDanhMuc,
                                tenNhomHuong, tenThuongHieu, quocGia, pageable);
                        break;
                }
            } else {
                // No sort specified, use default pageable
                pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
                sanPhamPage = spi.searchSanPhamCombined(
                        searchQuery, minPrice, maxPrice, tenDanhMuc,
                        tenNhomHuong, tenThuongHieu, quocGia, pageable);
            }

            // Lấy tổng số lượng tồn kho
            List<Object[]> tongSoLuongList = spi.findTongSoLuongBySanPham();

            // Chuyển danh sách tổng số lượng thành Map để tra cứu nhanh
            Map<Integer, Integer> tongSoLuongMap = new HashMap<>();
            for (Object[] result : tongSoLuongList) {
                Integer idSanPham = ((Number) result[0]).intValue();
                Integer tongSoLuong = ((Number) result[1]).intValue();
                tongSoLuongMap.put(idSanPham, tongSoLuong);
            }

            // Cập nhật tổng số lượng tồn kho vào DTO
            sanPhamPage.getContent().forEach(dto -> {
                Integer tongSoLuong = tongSoLuongMap.getOrDefault(dto.getIdSanPham(), 0);
                dto.setTongSoLuongTonKho(tongSoLuong);
            });

            return sanPhamPage;
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

        public List<SanPhamDetailDto> getAllProductDetailsList() {
            List<SanPhamDetailDto> allProducts = new ArrayList<>();
            try {
                List<SanPham> sanPhams = spi.findAll(); // Lấy tất cả sản phẩm từ repository
                if (sanPhams == null || sanPhams.isEmpty()) {
                    log.warn("No products found in the database");
                    return allProducts;
                }

                for (SanPham sanPham : sanPhams) {
                    try {
                        List<SanPhamDetailDto> productDetails = detail(sanPham.getIdSanPham());
                        if (productDetails != null) {
                            allProducts.addAll(productDetails);
                        }
                    } catch (Exception e) {
                        log.error("Error fetching details for product ID {}: {}", sanPham.getIdSanPham(), e.getMessage(), e);
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching all products: {}", e.getMessage(), e);
            }
            return allProducts;
        }

        public List<SanPhamDetailDto> getRecommendedProducts(SanPhamDetailDto currentProduct) {
            try {
                // Lấy tất cả sản phẩm
                List<SanPhamDetailDto> allProducts = getAllProductDetailsList();
                List<SanPhamDetailDto> recommendedProducts = new ArrayList<>();

                // Lọc trùng lặp dựa trên tenSanPham và chỉ lấy sản phẩm đầu tiên
                Map<String, SanPhamDetailDto> uniqueProductsMap = new HashMap<>();
                for (SanPhamDetailDto product : allProducts) {
                    String tenSanPham = product.getTenSanPham();
                    if (!uniqueProductsMap.containsKey(tenSanPham)) {
                        uniqueProductsMap.put(tenSanPham, product); // Chỉ giữ sản phẩm đầu tiên
                    }
                }

                // Chuyển Map thành List để tính điểm tương đồng
                List<SanPhamDetailDto> uniqueProducts = new ArrayList<>(uniqueProductsMap.values());

                // Tính điểm tương đồng cho từng sản phẩm
                List<ProductScore> productScores = new ArrayList<>();
                for (SanPhamDetailDto product : uniqueProducts) {
                    // Bỏ qua sản phẩm hiện tại
                    if (product.getIdSanPham().equals(currentProduct.getIdSanPham())) {
                        continue;
                    }

                    // Bỏ qua sản phẩm hết hàng
                    if (product.getSoLuongTonKho() <= 0) {
                        continue;
                    }

                    int score = 0;
                    // Cùng danh mục
                    if (product.getTenDanhMuc() != null && product.getTenDanhMuc().equals(currentProduct.getTenDanhMuc())) {
                        score += 3;
                    }
                    // Cùng thương hiệu
                    if (product.getTenThuongHieu() != null && product.getTenThuongHieu().equals(currentProduct.getTenThuongHieu())) {
                        score += 3;
                    }
                    // Cùng nhóm hương
                    if (product.getTenNhomHuong() != null && product.getTenNhomHuong().equals(currentProduct.getTenNhomHuong())) {
                        score += 2;
                    }
                    // Thành phần hương tương tự
                    if (hasMatchingHuong(product, currentProduct)) {
                        score += 1;
                    }
                    // Phong cách tương tự
                    if (hasMatchingPhongCach(product.getPhongCachs(), currentProduct.getPhongCachs())) {
                        score += 2;
                    }
                    // Mức giá tương đương (±20%)
                    if (isPriceInRange(product.getDonGia(), currentProduct.getDonGia())) {
                        score += 1;
                    }

                    productScores.add(new ProductScore(product, score));
                }

                // Sắp xếp theo điểm số và lấy tối đa 6 sản phẩm
                productScores.sort((a, b) -> b.getScore() - a.getScore());
                recommendedProducts = productScores.stream()
                        .map(ProductScore::getProduct)
                        .limit(6)
                        .collect(Collectors.toList());

                return recommendedProducts;
            } catch (Exception e) {
                log.error("Error getting recommended products: {}", e.getMessage(), e);
                return new ArrayList<>(); // Trả về danh sách rỗng thay vì ném lỗi 500
            }
        }

        // Các phương thức khác giữ nguyên
        private boolean hasMatchingHuong(SanPhamDetailDto product, SanPhamDetailDto currentProduct) {
            String[] huongDau = currentProduct.getMoTaHuongDau() != null ? currentProduct.getMoTaHuongDau().split(", ") : new String[]{};
            String[] huongGiua = currentProduct.getMoTaHuongGiua() != null ? currentProduct.getMoTaHuongGiua().split(", ") : new String[]{};
            String[] huongCuoi = currentProduct.getMoTaHuongCuoi() != null ? currentProduct.getMoTaHuongCuoi().split(", ") : new String[]{};
            String[] targetHuongDau = product.getMoTaHuongDau() != null ? product.getMoTaHuongDau().split(", ") : new String[]{};
            String[] targetHuongGiua = product.getMoTaHuongGiua() != null ? product.getMoTaHuongGiua().split(", ") : new String[]{};
            String[] targetHuongCuoi = product.getMoTaHuongCuoi() != null ? product.getMoTaHuongCuoi().split(", ") : new String[]{};

            return Stream.of(huongDau, huongGiua, huongCuoi)
                    .flatMap(Arrays::stream)
                    .anyMatch(h1 -> Stream.of(targetHuongDau, targetHuongGiua, targetHuongCuoi)
                            .flatMap(Arrays::stream)
                            .anyMatch(h2 -> h2.equalsIgnoreCase(h1)));
        }

        private boolean hasMatchingPhongCach(String phongCach1, String phongCach2) {
            if (phongCach1 == null || phongCach2 == null) return false;
            String[] styles1 = phongCach1.split(", ");
            String[] styles2 = phongCach2.split(", ");
            return Arrays.stream(styles1)
                    .anyMatch(s1 -> Arrays.stream(styles2)
                            .anyMatch(s2 -> s2.equalsIgnoreCase(s1)));
        }

        private boolean isPriceInRange(BigDecimal price, BigDecimal currentPrice) {
            if (price == null || currentPrice == null) return false;
            BigDecimal lowerBound = currentPrice.multiply(BigDecimal.valueOf(0.8));
            BigDecimal upperBound = currentPrice.multiply(BigDecimal.valueOf(1.2));
            return price.compareTo(lowerBound) >= 0 && price.compareTo(upperBound) <= 0;
        }

        private static class ProductScore {
            private SanPhamDetailDto product;
            private int score;

            public ProductScore(SanPhamDetailDto product, int score) {
                this.product = product;
                this.score = score;
            }

            public SanPhamDetailDto getProduct() {
                return product;
            }

            public int getScore() {
                return score;
            }
        }


    }
