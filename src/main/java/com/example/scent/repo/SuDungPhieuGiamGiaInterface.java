package com.example.scent.repo;

import com.example.scent.entity.SuDungPhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface SuDungPhieuGiamGiaInterface extends JpaRepository<SuDungPhieuGiamGia, Integer> {
    Optional<SuDungPhieuGiamGia> findByPhieuGiamGiaIdAndSdt(Integer phieuGiamGiaId, String sdt);
}
