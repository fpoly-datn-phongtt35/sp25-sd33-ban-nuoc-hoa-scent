package com.example.scent.repo;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamDungTich;
import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository

public interface SanPhamInterface extends JpaRepository<SanPham, Integer>, JpaSpecificationExecutor<SanPham> {
    //List<SanPham> findByTenContainingIgnoreCase(String tenSanPham);

    // các bí danh như idSanPham, tenSanPham, idSpct,...
// cần phải trùng với ánh xạ nếu ko jpa
// sẽ ko tìm thấy chúng và trả về null
//@Query(value = "select\n" +
//        "sp.id as idSanPham,\n" +
//        "sp.ten as tenSanPham,\n" +
//        "sp.mo_ta as moTaSanPham,\n" +
//        "spct.id as idSpct,\n" +
//        "spct.don_gia as donGia,\n" +
//        "spct.so_luong_ton_kho as soLuongTonKho,\n" +
//        "spct.dung_tich as dungTich\n" +
//        "from \n" +
//        "san_pham sp\n" +
//        "left join \n" +
//        "spct spct on sp.id = spct.id_san_pham\n" +
//        "where\n" +
//        "    sp.id = :idSanPham", nativeQuery = true)
//List<SanPhamDto> getDetail(@Param("idSanPham") Integer idSanPham);
    @Query(value = "select\n" +
            "    sp.id as idSanPham,\n" +
            "    sp.ten as tenSanPham,\n" +
            "    sp.mo_ta as moTaSanPham,\n" +
            "    spct.id as idSpct,\n" +
            "    spct.don_gia as donGia,\n" +
            "    spct.so_luong_ton_kho as soLuongTonKho,\n" +
            "    spct.dung_tich as dungTich,\n" +
            "    th.ten_thuong_hieu as tenThuongHieu,\n" +
            "    dm.ten_danh_muc as tenDanhMuc,\n" +
            "    hd.mota as moTaHuongDau,\n" +
            "    hg.mota as moTaHuongGiua,\n" +
            "    hc.mota as moTaHuongCuoi,\n" +
            "    ha.link as imageURL\n" +
            "from \n" +
            "    san_pham sp\n" +
            "LEFT JOIN hinh_anh ha on sp.id = ha.id_san_pham\n" +
            "left join \n" +
            "    spct spct on sp.id = spct.id_san_pham\n" +
            "left join \n" +
            "    thuong_hieu th on sp.id_thuong_hieu = th.id\n" +
            "left join \n" +
            "    danh_muc dm on sp.id_danh_muc = dm.id\n" +
            "left join \n" +
            "    huong_dau hd on sp.id_huong_dau = hd.id\n" +
            "left join \n" +
            "    huong_giua hg on sp.id_huong_giua = hg.id\n" +
            "left join \n" +
            "    huong_cuoi hc on sp.id_huong_cuoi = hc.id\n" +
            "where\n" +
            "    sp.id = :idSanPham\n ", nativeQuery = true)
    List<SanPhamDto> getDetail(@Param("idSanPham") Integer idSanPham);


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.huongCuoi hc " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi")
    Page<SanPhamInfoDTO> findAllProductsWithImages(Pageable pageable);

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.huongCuoi hc " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.hinhAnhs ha " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi " +
            "ORDER BY MIN(spct.donGia) DESC")
    List<SanPhamInfoDTO> findAllProductsWithImagesSorted();


    @Query(value = "select * from san_pham where lower(ten) like lower(CONCAT('%', :tenSanPham, '%'))", nativeQuery = true)
    List<SanPham> searchByName(@Param("tenSanPham") String tenSanPham);


    @Query("SELECT new com.example.scent.dto.SanPhamDungTich(p.idSanPham, spct.dungTich, spct.donGia) FROM SanPham p JOIN p.spcts spct WHERE p.idSanPham = ?1")
    List<SanPhamDungTich> findByIdSanPham(Integer productId);

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.huongCuoi hc " +
            "WHERE sp.tenSanPham LIKE %:searchQuery% " +
            "OR th.tenThuongHieu LIKE %:searchQuery% " +
            "OR hd.moTaHuongDau LIKE %:searchQuery% " +
            "OR hg.moTaHuongGiua LIKE %:searchQuery% " +
            "OR hc.moTaHuongCuoi LIKE %:searchQuery% " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi ")
    Page<SanPhamInfoDTO> findBySearchQuery(@Param("searchQuery") String searchQuery, Pageable pageable);

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "LEFT JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.danhMuc dm " +
            "LEFT JOIN sp.huongDau hd " +
            "LEFT JOIN sp.huongGiua hg " +
            "LEFT JOIN sp.huongCuoi hc " +
            "WHERE (:minPrice IS NULL OR spct.donGia >= :minPrice) " +
            "AND (:maxPrice IS NULL OR spct.donGia <= :maxPrice) " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi " +
            "ORDER BY MIN(spct.donGia) ASC")
    Page<SanPhamInfoDTO> searchSanPhamByPrice(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
}


