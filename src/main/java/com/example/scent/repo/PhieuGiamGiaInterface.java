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

}
