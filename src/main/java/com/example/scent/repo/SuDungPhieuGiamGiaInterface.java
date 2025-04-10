package com.example.scent.repo;

import com.example.scent.entity.SuDungPhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuDungPhieuGiamGiaInterface extends JpaRepository<SuDungPhieuGiamGia, Integer> {
    Optional<SuDungPhieuGiamGia> findByPhieuGiamGiaIdAndSdt(Integer phieuGiamGiaId, String sdt);
}
