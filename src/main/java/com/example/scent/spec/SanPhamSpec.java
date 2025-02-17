package com.example.scent.spec;

import com.example.scent.entity.SanPham;
import org.springframework.data.jpa.domain.Specification;

public class SanPhamSpec {
    public static Specification<SanPham> hasThuongHieu(Integer idThuongHieu) {
        return (root, query, criteriaBuilder) ->
                idThuongHieu == null ?
                        criteriaBuilder.conjunction() :
                        criteriaBuilder.equal(root.get("thuongHieu").get("id"), idThuongHieu);
    }

    public static Specification<SanPham> hasDanhMuc(Integer idDanhMuc) {
        return (root, query, criteriaBuilder) ->
                idDanhMuc == null ?
                        criteriaBuilder.conjunction() :
                        criteriaBuilder.equal(root.get("danhMuc").get("id"), idDanhMuc);
    }
}
