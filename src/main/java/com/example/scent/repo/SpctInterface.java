package com.example.scent.repo;

import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpctInterface extends JpaRepository<Spct, Integer>, JpaSpecificationExecutor<Spct> {
    @Query(value = "SELECT *\n" +
            "FROM spct \n" +
            "WHERE id_san_pham =:idSanPham", nativeQuery = true)
    List<Spct> findByidSanPham(@Param("idSanPham") int idSanPham);

    @Query("SELECT spct FROM Spct spct " +
            "ORDER BY CASE WHEN spct.soLuongTonKho <= 5 THEN 0 ELSE 1 END, spct.idSpct")
    List<Spct> findAll();
    List<Spct> findBySanPhamIdSanPham(int idSanPham);
    List<Spct> findByIdSpctIn(List<Integer> ids);
}

