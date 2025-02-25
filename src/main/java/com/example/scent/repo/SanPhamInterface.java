package com.example.scent.repo;

import com.example.scent.dto.SanPhamDto;
import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), MIN(ha.link)) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +

            "GROUP BY sp.idSanPham, sp.tenSanPham")
    Page<SanPhamInfoDTO> findAllProductsWithImages(Pageable pageable);

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), MIN(ha.link)) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "GROUP BY sp.idSanPham, sp.tenSanPham " +
            "ORDER BY MIN(spct.donGia) DESC")
    List<SanPhamInfoDTO> findAllProductsWithImagesSorted();
    @Query(value = "select * from san_pham where lower(ten) like lower(CONCAT('%', :tenSanPham, '%'))", nativeQuery = true)
    List<SanPham> searchByName(@Param("tenSanPham") String tenSanPham);


}

