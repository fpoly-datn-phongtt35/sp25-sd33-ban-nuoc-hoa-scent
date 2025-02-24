package com.example.scent.service;


import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.entity.HinhAnh;
import com.example.scent.entity.SanPham;
import com.example.scent.repo.HinhAnhInterface;
import com.example.scent.repo.SanPhamInterface;
import com.example.scent.spec.SanPhamSpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.io.IOException;


@Service
public class SanPhamSv {
    @Autowired
    SanPhamInterface spi;

    @Autowired
    HinhAnhInterface hai;

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


    public String uploadImageToPostimages(MultipartFile image) throws IOException {
        String apiUrl = "https://postimages.org/json/upload";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultipartFile> entity = new HttpEntity<>(image, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

        if (response.getStatusCodeValue() == 200) {
            String responseBody = response.getBody();

            String imageUrl = parseImageUrlFromResponse(responseBody);
            return imageUrl;
        } else {
            throw new IOException("Không thể tải hình ảnh lên Postimages.org");
        }
    }


    private String parseImageUrlFromResponse(String responseBody) {

        return "https://example.com/image.jpg";
    }

    public void saveImage(Integer idSanPham, String imageUrl) {
        HinhAnh hinhAnh = new HinhAnh();
        hinhAnh.getSanPham().setIdSanPham(idSanPham);
        hinhAnh.setLink(imageUrl);
        hai.save(hinhAnh);
    }
}
