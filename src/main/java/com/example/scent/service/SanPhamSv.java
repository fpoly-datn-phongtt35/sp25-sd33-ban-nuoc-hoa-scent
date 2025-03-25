package com.example.scent.service;


import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamDungTich;
import com.example.scent.dto.SanPhamInfoDTO;
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
import java.util.Map;
import java.util.List;



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
        String apiUrl = "https://api.imgbb.com/1/upload?key=af27bc3080c57dc57c61576a2e1cdaff"; // Thay API_KEY của bạn
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", file.getResource());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, requestEntity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return (String) ((Map) response.getBody().get("data")).get("url");
        }
        return null;
    }

    public SanPham addProductWithDetails(
            String tenSanPham, String moTaSanPham, Integer idThuongHieu, Integer idDanhMuc,
            Integer idHuongDau, Integer idHuongGiua, Integer idHuongCuoi, MultipartFile image) {

        SanPham sanPham = new SanPham();
        sanPham.setTenSanPham(tenSanPham);
        sanPham.setMoTaSanPham(moTaSanPham);

        sanPham.setThuongHieu(thuongHieuRepo.findById(idThuongHieu).orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại")));
        sanPham.setDanhMuc(danhMucRepo.findById(idDanhMuc).orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
        sanPham.setHuongDau(huongDauRepo.findById(idHuongDau).orElse(null));
        sanPham.setHuongGiua(huongGiuaRepo.findById(idHuongGiua).orElse(null));
        sanPham.setHuongCuoi(huongCuoiRepo.findById(idHuongCuoi).orElse(null));

        SanPham savedSanPham = spi.save(sanPham);

        if (image != null && !image.isEmpty()) {
            String imageUrl = uploadImageToPostimages(image);
            if (imageUrl != null) {
                HinhAnh hinhAnh = new HinhAnh();
                hinhAnh.setLink(imageUrl);
                hinhAnh.setSanPham(savedSanPham);
                hai.save(hinhAnh);
            }
        }
        return savedSanPham;
    }

    public List<SanPhamDungTich> getProductVolumesByProductId(Integer productId) {
        return spi.findByIdSanPham(productId);
    }

    public Page<SanPhamInfoDTO> findBySearchQuery(String searchQuery, Pageable pageable) {
        return spi.findBySearchQuery(searchQuery, pageable);
    }

    public Page<SanPhamInfoDTO> searchSanPham( BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return spi.searchSanPhamByPrice(minPrice, maxPrice, pageable);
    }

    public Page<SanPhamInfoDTO> findSanPhamByDanhMuc(String tenDanhMuc,Pageable pageable) {
        return spi.findSanPhamByDanhMuc(tenDanhMuc,pageable);
    }
}
