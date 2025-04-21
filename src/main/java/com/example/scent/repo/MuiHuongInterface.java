package com.example.scent.repo;

import com.example.scent.entity.MuiHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MuiHuongInterface extends JpaRepository<MuiHuong, Integer> {
    @Query("SELECT COUNT(spmh) > 0 FROM SanPhamMuiHuong spmh WHERE spmh.muiHuong.id = :muiHuongId")
    boolean existsSanPhamByMuiHuongId(Integer muiHuongId);
}
