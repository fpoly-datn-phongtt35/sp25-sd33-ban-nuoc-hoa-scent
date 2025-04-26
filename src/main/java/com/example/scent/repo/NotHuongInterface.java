package com.example.scent.repo;

import com.example.scent.entity.NotHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotHuongInterface extends JpaRepository<NotHuong, Integer> {
    @Query(value = "SELECT CAST(CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS BIT) " +
            "FROM ( " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  JOIN huong_dau_not_huong hdn ON sp.id_huong_dau = hdn.id_huong_dau " +
            "  WHERE hdn.id_not_huong = :notHuongId " +
            "  UNION " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  JOIN huong_giua_not_huong hgn ON sp.id_huong_giua = hgn.id_huong_giua " +
            "  WHERE hgn.id_not_huong = :notHuongId " +
            "  UNION " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  JOIN huong_cuoi_not_huong hcn ON sp.id_huong_cuoi = hcn.id_huong_cuoi " +
            "  WHERE hcn.id_not_huong = :notHuongId " +
            "  UNION " +
            "  SELECT sp.id " +
            "  FROM san_pham sp " +
            "  JOIN san_pham_mui_huong spmh ON sp.id = spmh.id_san_pham " +
            "  JOIN not_huong nh ON spmh.id_mui_huong = nh.id_mui_huong " +
            "  WHERE nh.id = :notHuongId " +
            ") AS linked_products", nativeQuery = true)
    boolean existsSanPhamByNotHuongId(@Param("notHuongId") Integer notHuongId);
}
