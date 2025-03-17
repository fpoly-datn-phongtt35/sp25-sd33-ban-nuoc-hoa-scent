package com.example.scent.repo;

import com.example.scent.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface CTDHInterface extends JpaRepository<ChiTietDonHang, Integer>{
    List<ChiTietDonHang> findByDonHangId(Integer donHangId);
}
