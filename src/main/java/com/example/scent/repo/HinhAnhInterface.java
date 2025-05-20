package com.example.scent.repo;

import com.example.scent.entity.HinhAnh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface HinhAnhInterface extends JpaRepository<HinhAnh, Integer>{
//    List<HinhAnh> findBySanPhamId(Integer sanPhamId); // 🔥 Phải đúng định danh cột

        List<HinhAnh> findBySanPhamIdSanPham(Integer sanPhamId);

        @Query("SELECT h FROM HinhAnh h WHERE h.sanPham.idSanPham = :sanPhamId")
        List<HinhAnh> findHinhAnhBySanPhamId(@Param("sanPhamId") Integer sanPhamId);

        @Query("SELECT ha FROM HinhAnh ha WHERE ha.sanPham.idSanPham = :sanPhamId ORDER BY ha.id LIMIT 1")
        Optional<HinhAnh> findFirstBySanPhamId(Integer sanPhamId);
}
