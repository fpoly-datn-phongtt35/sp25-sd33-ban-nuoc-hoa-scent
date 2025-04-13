package com.example.scent.repo;

import com.example.scent.dto.*;
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
            "    nh.ten_nhom as tenNhomHuong,\n" + // Sửa từ nh.ten_nhom_huong thành nh.ten_nhom
            "    STRING_AGG(pc.ten_phong_cach, ', ') as phongCachs,\n" +
            "    STRING_AGG(ha.link, ', ') as imageURL\n" +
            "from \n" +
            "    san_pham sp\n" +
            "LEFT JOIN hinh_anh ha on sp.id = ha.id_san_pham\n" +
            "LEFT JOIN spct spct on sp.id = spct.id_san_pham\n" +
            "LEFT JOIN thuong_hieu th on sp.id_thuong_hieu = th.id\n" +
            "LEFT JOIN danh_muc dm on sp.id_danh_muc = dm.id\n" +
            "LEFT JOIN huong_dau hd on sp.id_huong_dau = hd.id\n" +
            "LEFT JOIN huong_giua hg on sp.id_huong_giua = hg.id\n" +
            "LEFT JOIN huong_cuoi hc on sp.id_huong_cuoi = hc.id\n" +
            "LEFT JOIN nhom_huong nh on sp.id_nhom_huong = nh.id\n" +
            "LEFT JOIN san_pham_phong_cach sppc on sp.id = sppc.id_san_pham\n" +
            "LEFT JOIN phong_cach pc on sppc.id_phong_cach = pc.id\n" +
            "where\n" +
            "    sp.id = :idSanPham\n" +
            "GROUP BY sp.id, sp.ten, sp.mo_ta, spct.id, spct.don_gia, spct.so_luong_ton_kho, spct.dung_tich, th.ten_thuong_hieu, dm.ten_danh_muc, hd.mota, hg.mota, hc.mota, nh.ten_nhom", // Sửa từ nh.ten_nhom_huong thành nh.ten_nhom
            nativeQuery = true)
    List<SanPhamDto> getDetail(@Param("idSanPham") Integer idSanPham);
    @Query(value = "select\n" +
            "    mh.ten_mui_huong as tenMuiHuong,\n" +
            "    spmh.prominence as prominence\n" +
            "from \n" +
            "    san_pham_mui_huong spmh\n" +
            "JOIN mui_huong mh on spmh.id_mui_huong = mh.id\n" +
            "where\n" +
            "    spmh.id_san_pham = :idSanPham",
            nativeQuery = true)
    List<MuiHuongDto> getMuiHuongsBySanPhamId(@Param("idSanPham") Integer idSanPham);

    @Query(value = "SELECT TOP 10 " +
            "sp.id AS idSanPham, " +
            "sp.ten AS tenSanPham, " +
            "sp.mo_ta AS moTaSanPham, " +
            "spct.dung_tich AS dungTich, " +
            "spct.don_gia AS donGia, " +
            "spct.so_luong_ton_kho AS soLuongTonKho, " +
            "spct.id AS idSpct, " +
            "(SELECT STRING_AGG(ha.link, ', ') FROM hinh_anh ha WHERE ha.id_san_pham = sp.id) AS imageURL, " +
            "SUM(ctdh.so_luong) AS tongSoLuongBan " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "JOIN don_hang dh ON dh.id = ctdh.id_don_hang " +
            "WHERE dh.trang_thai = 2 and sp.trang_thai = 1" + //không biết trạng tháng đơn hoàn thành là số mấy nên lấy tạm 2, update lại thành trạng thái đúng sau
            "GROUP BY sp.id, sp.ten, sp.mo_ta, spct.dung_tich, spct.don_gia, spct.so_luong_ton_kho, spct.id " +
            "ORDER BY tongSoLuongBan DESC ", nativeQuery = true)
    List<SanPhamBanChayDto> getTop10SanPhamBanChay();

    @Query(value = "SELECT TOP 1 " +
            "sp.id AS idSanPham, " +
            "sp.ten AS tenSanPham, " +
            "sp.mo_ta AS moTaSanPham, " +
            "spct.dung_tich AS dungTich, " +
            "spct.don_gia AS donGia, " +
            "spct.so_luong_ton_kho AS soLuongTonKho, " +
            "spct.id AS idSpct, " +
            "(SELECT STRING_AGG(ha.link, ', ') FROM hinh_anh ha WHERE ha.id_san_pham = sp.id) AS imageURL, " +
            "SUM(ctdh.so_luong) AS tongSoLuongBan " +
            "FROM chi_tiet_don_hang ctdh " +
            "JOIN spct ON ctdh.id_spct = spct.id " +
            "JOIN san_pham sp ON spct.id_san_pham = sp.id " +
            "JOIN don_hang dh ON dh.id = ctdh.id_don_hang " +
            "WHERE dh.trang_thai = 2 and sp.trang_thai = 1" +  //không biết trạng tháng đơn hoàn thành là số mấy nên lấy tạm 2, update lại thành trạng thái đúng sau
            "GROUP BY sp.id, sp.ten, sp.mo_ta, spct.dung_tich, spct.don_gia, spct.so_luong_ton_kho, spct.id " +
            "ORDER BY tongSoLuongBan ASC ", nativeQuery = true)
    List<SanPhamBanChayDto> getTop10SanPhamBanIt();

    @Query(value = "SELECT TOP 5 sp.id AS idSanPham, " +
            "sp.ten AS tenSanPham, " +
            "sp.mo_ta AS moTa, " +
            "spct.dung_tich AS dungTich, " +
            "spct.don_gia AS donGia, " +
            "spct.so_luong_ton_kho AS soLuongTonKho, " +
            "spct.id AS idSpct, " +
            "(SELECT STRING_AGG(ha.link, ', ') FROM hinh_anh ha WHERE ha.id_san_pham = sp.id) AS imageURL " +
            "FROM san_pham sp " +
            "JOIN spct ON spct.id_san_pham = sp.id " +
            "WHERE sp.trang_thai = 1" +
            "ORDER BY soLuongTonKho ASC", nativeQuery = true)
    List<SanPhamTonKhoDTO> findTop5BySoLuongTonKhoAsc();

    @Query(value = "SELECT TOP 5 sp.id AS idSanPham, " +
            "sp.ten AS tenSanPham, " +
            "sp.mo_ta AS moTaSanPham, " +
            "spct.dung_tich AS dungTich, " +
            "spct.don_gia AS donGia, " +
            "spct.so_luong_ton_kho AS soLuongTonKho, " +
            "spct.id AS idSpct, " +
            "(SELECT STRING_AGG(ha.link, ', ') FROM hinh_anh ha WHERE ha.id_san_pham = sp.id) AS imageURL " +
            "FROM san_pham sp " +
            "JOIN spct ON spct.id_san_pham = sp.id " +
            "WHERE sp.trang_thai = 1" +
            "ORDER BY soLuongTonKho Desc ", nativeQuery = true)
    List<SanPhamTonKhoDTO> findTop5BySoLuongTonKhoDesc();


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.nhomHuong nh " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.huongCuoi hc " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai ")
    Page<SanPhamInfoDTO> findAllProductsWithImages(Pageable pageable);

    //

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id,nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.huongCuoi hc " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.nhomHuong nh " +
            "JOIN sp.hinhAnhs ha " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id ,nh.tenNhomHuong , th.quocGia ,sp.trangThai " +
            "ORDER BY MIN(spct.donGia) DESC")
    List<SanPhamInfoDTO> findAllProductsWithImagesSorted();





    @Query(value = "select * from san_pham where lower(ten) like lower(CONCAT('%', :tenSanPham, '%'))", nativeQuery = true)
    List<SanPham> searchByName(@Param("tenSanPham") String tenSanPham);


    @Query("SELECT new com.example.scent.dto.SanPhamDungTich" +
            "(p.idSanPham,spct.dungTich, spct.donGia,spct.idSpct,spct.soLuongTonKho) " +
            "FROM SanPham p JOIN p.spcts spct WHERE p.idSanPham = ?1 and spct.trangThai=1")
    List<SanPhamDungTich> findByIdSanPham(Integer productId);

    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.nhomHuong nh " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.huongCuoi hc " +
            "WHERE LOWER(sp.tenSanPham) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(th.tenThuongHieu) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(dm.tenDanhMuc) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(hd.moTaHuongDau) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(hg.moTaHuongGiua) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(hc.moTaHuongCuoi) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(nh.tenNhomHuong) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, th.quocGia, sp.trangThai ")
    Page<SanPhamInfoDTO> findBySearchQuery(@Param("searchQuery") String searchQuery, Pageable pageable);


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.nhomHuong nh " +
            "JOIN sp.huongCuoi hc " +
            "WHERE (:minPrice IS NULL OR spct.donGia >= :minPrice) " +
            "AND (:maxPrice IS NULL OR spct.donGia <= :maxPrice) " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, th.quocGia, sp.trangThai " +
            "ORDER BY MIN(spct.donGia) ASC")
    Page<SanPhamInfoDTO> searchSanPhamByPrice(@Param("minPrice") BigDecimal minPrice,
                                              @Param("maxPrice") BigDecimal maxPrice,
                                              Pageable pageable);


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.nhomHuong nh " +
            "LEFT JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.danhMuc dm " +
            "LEFT JOIN sp.huongDau hd " +
            "LEFT JOIN sp.huongGiua hg " +
            "LEFT JOIN sp.huongCuoi hc " +
            "WHERE (dm.tenDanhMuc = ?1 OR ?1 IS NULL) " +  // Điều kiện cho tenDanhMuc, cho phép null
            "AND (nh.tenNhomHuong = ?2 OR ?2 IS NULL) " +  // Điều kiện cho tenNhomHuong, cho phép null
            "AND (th.tenThuongHieu = ?3 OR ?3 IS NULL) " +  // Điều kiện cho tenThuongHieu, cho phép null
            "AND (th.quocGia = ?4 OR ?4 IS NULL) " +  // Điều kiện cho quocGia, cho phép null
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, th.quocGia, nh.tenNhomHuong, sp.trangThai " +
            "ORDER BY MIN(spct.donGia)")
    Page<SanPhamInfoDTO> findSanPhamByField(String tenDanhMuc, String tenNhomHuong, String tenThuongHieu, String quocGia, Pageable pageable);


    @Query("SELECT new com.example.scent.dto.SanPhamInfoDTO(" +
            "sp.idSanPham, sp.tenSanPham, MIN(spct.donGia), " +
            "MIN(ha.link), th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai) " +
            "FROM SanPham sp " +
            "JOIN sp.spcts spct " +
            "JOIN sp.hinhAnhs ha " +
            "JOIN sp.thuongHieu th " +
            "JOIN sp.huongDau hd " +
            "JOIN sp.huongGiua hg " +
            "JOIN sp.nhomHuong nh " +
            "JOIN sp.danhMuc dm " +
            "JOIN sp.huongCuoi hc " +
            "WHERE sp.trangThai=1 and (:searchQuery IS NULL OR :searchQuery = '' OR " +
            "LOWER(sp.tenSanPham) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(th.tenThuongHieu) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(dm.tenDanhMuc) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(hd.moTaHuongDau) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(hg.moTaHuongGiua) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(hc.moTaHuongCuoi) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
            "LOWER(nh.tenNhomHuong) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) " +

            "AND (:minPrice IS NULL OR spct.donGia >= :minPrice) " +
            "AND (:maxPrice IS NULL OR spct.donGia <= :maxPrice) " +
            "AND (:tenDanhMuc IS NULL OR :tenDanhMuc = '' OR dm.tenDanhMuc = :tenDanhMuc) " +
            "AND (:tenNhomHuong IS NULL OR :tenNhomHuong = '' OR nh.tenNhomHuong = :tenNhomHuong) " +
            "AND (:tenThuongHieu IS NULL OR :tenThuongHieu = '' OR th.tenThuongHieu = :tenThuongHieu) " +
            "AND (:quocGia IS NULL OR :quocGia = '' OR th.quocGia = :quocGia) " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, nh.id, nh.tenNhomHuong, th.quocGia,sp.trangThai "
            )
    Page<SanPhamInfoDTO> searchSanPhamCombined(
            @Param("searchQuery") String searchQuery,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("tenDanhMuc") String tenDanhMuc,
            @Param("tenNhomHuong") String tenNhomHuong,
            @Param("tenThuongHieu") String tenThuongHieu,
            @Param("quocGia") String quocGia,
            Pageable pageable);
    //
    @Query("SELECT new com.example.scent.dto.SPTQDTO(" +
            "sp.idSanPham, concat(sp.tenSanPham,' ', spct.dungTich, 'ml'), spct.donGia, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, sp.nhomHuong.id, nh.tenNhomHuong, th.quocGia, " +
            "min(ha.link), spct.dungTich, spct.idSpct,sp.trangThai,spct.trangThai) " +
            "FROM SanPham sp " +
            "LEFT JOIN Spct spct ON spct.sanPham.idSanPham = sp.idSanPham " +
            "LEFT JOIN sp.thuongHieu th " +
            "LEFT JOIN sp.danhMuc dm " +
            "LEFT JOIN sp.huongDau hd " +
            "LEFT JOIN sp.huongGiua hg " +
            "LEFT JOIN sp.huongCuoi hc " +
            "LEFT JOIN sp.nhomHuong nh " +
            "LEFT JOIN sp.hinhAnhs ha " +
            "WHERE sp.trangThai = 1 and spct.trangThai=1" + // Thêm điều kiện lọc trạng thái
            "AND (:keyword IS NULL OR " +
            "sp.tenSanPham LIKE %:keyword% OR " +
            "th.tenThuongHieu LIKE %:keyword% OR " +
            "dm.tenDanhMuc LIKE %:keyword%) " +
            "GROUP BY sp.idSanPham, sp.tenSanPham, spct.dungTich, spct.donGia, th.tenThuongHieu, dm.tenDanhMuc, " +
            "hd.moTaHuongDau, hg.moTaHuongGiua, hc.moTaHuongCuoi, " +
            "sp.nhomHuong.id, nh.tenNhomHuong,sp.trangThai,spct.trangThai," +
            " th.quocGia, spct.dungTich, spct.idSpct")
    List<SPTQDTO> getALLSPQT(@Param("keyword") String keyword);
    @Query("SELECT DISTINCT sp FROM SanPham sp " +
            "LEFT JOIN FETCH sp.thuongHieu th " +
            "LEFT JOIN FETCH sp.danhMuc dm " +
            "LEFT JOIN FETCH sp.nhomHuong nh " +
            "LEFT JOIN FETCH sp.huongDau hd " +
            "LEFT JOIN FETCH sp.huongGiua hg " +
            "LEFT JOIN FETCH sp.huongCuoi hc " +
            "WHERE LOWER(sp.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SanPham> findByTenContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);
}


