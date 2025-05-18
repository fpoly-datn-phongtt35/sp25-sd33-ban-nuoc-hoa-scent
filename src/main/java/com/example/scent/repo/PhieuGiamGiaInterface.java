package com.example.scent.repo;

import com.example.scent.entity.PhieuGiamGia;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository

public interface PhieuGiamGiaInterface extends JpaRepository<PhieuGiamGia, Integer>{
    @Query("SELECT pgg FROM PhieuGiamGia pgg " +
            "WHERE (:maGiamGia IS NULL OR pgg.maGiamGia LIKE %:maGiamGia%) " +
            "AND (:giaTriGiam IS NULL OR pgg.giaTriGiam = :giaTriGiam)")
    Page<PhieuGiamGia> findByMaGiamGiaContainingAndGiaTriGiam(@Param("maGiamGia") String maGiamGia,
                                                              @Param("giaTriGiam") BigDecimal giaTriGiam,
                                                              Pageable pageable);
    boolean existsByMaGiamGia(String maGiamGia);
    Optional<PhieuGiamGia> findByMaGiamGia(String maGiamGia);
    List<PhieuGiamGia> findAllByTrangThaiAndNgayHetHanBefore(int trangThai, LocalDateTime dateTime);
    List<PhieuGiamGia> findAllByTrangThaiAndNgayHetHanAfter(int trangThai, LocalDateTime dateTime);
    List<PhieuGiamGia> findAllByTrangThaiAndNgayBatDauBeforeOrNgayBatDauEquals(
            int trangThai,
            LocalDateTime ngayBatDauBefore,
            LocalDateTime ngayBatDauEquals
    );
    @Query("SELECT p FROM PhieuGiamGia p WHERE (:maGiamGia IS NULL OR p.maGiamGia LIKE %:maGiamGia%) " +
            "AND (:giaTri IS NULL OR p.giaTriGiam = :giaTri) " +
            "AND (:ngayBatDau IS NULL OR p.ngayBatDau >= :ngayBatDau) " +
            "AND (:ngayHetHan IS NULL OR p.ngayHetHan <= :ngayHetHan) " +
            "AND (:soLuong IS NULL OR p.soLuong = :soLuong) " +
            "AND (:giaTriToiDa IS NULL OR p.gia_tri_toi_da = :giaTriToiDa) " +
            "AND (:giaTriToiThieu IS NULL OR p.giaTriDonToiThieu = :giaTriToiThieu) " +
            "AND (:trangThai IS NULL OR p.trangThai = :trangThai) " +
            "AND (:dieuKienapDung IS NULL OR p.dieuKienapDung = :dieuKienapDung) " + // Thêm điều kiện lọc dieuKienapDung
            "ORDER BY p.id DESC")
    Page<PhieuGiamGia> searchVouchers(
            @Param("maGiamGia") String maGiamGia,
            @Param("giaTri") Double giaTri,
            @Param("ngayBatDau") LocalDateTime ngayBatDau,
            @Param("ngayHetHan") LocalDateTime ngayHetHan,
            @Param("soLuong") Integer soLuong,
            @Param("giaTriToiDa") Integer giaTriToiDa,
            @Param("giaTriToiThieu") Integer giaTriToiThieu,
            @Param("trangThai") Integer trangThai,
            @Param("dieuKienapDung") Integer dieuKienapDung, // Thêm tham số dieuKienapDung
            Pageable pageable
    );
    boolean existsByMaGiamGiaAndIdNot(String maGiamGia, Integer id);
}
