package com.example.scent.repo;

import com.example.scent.entity.NotHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotHuongInterface extends JpaRepository<NotHuong, Integer> {
    @Query("SELECT COUNT(spmh) > 0 FROM SanPhamMuiHuong spmh WHERE spmh.muiHuong.id = (SELECT nh.muiHuong.id FROM NotHuong nh WHERE nh.id = :notHuongId)")
    boolean existsSanPhamByNotHuongId(Integer notHuongId);
}
