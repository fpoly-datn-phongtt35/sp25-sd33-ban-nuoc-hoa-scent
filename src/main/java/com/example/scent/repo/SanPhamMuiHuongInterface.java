package com.example.scent.repo;

import com.example.scent.entity.SanPhamMuiHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SanPhamMuiHuongInterface extends JpaRepository<SanPhamMuiHuong, Integer> {
}
