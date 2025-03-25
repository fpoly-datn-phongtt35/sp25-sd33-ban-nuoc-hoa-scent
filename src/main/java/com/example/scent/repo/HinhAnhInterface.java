package com.example.scent.repo;

import com.example.scent.entity.HinhAnh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface HinhAnhInterface extends JpaRepository<HinhAnh, Integer>{
//    List<HinhAnh> findBySanPhamId(Integer sanPhamId); // 🔥 Phải đúng định danh cột


        @Query("SELECT h FROM HinhAnh h WHERE h.sanPham.idSanPham = :sanPhamId")
        List<HinhAnh> findBySanPhamId(@Param("sanPhamId") Integer sanPhamId);

}
