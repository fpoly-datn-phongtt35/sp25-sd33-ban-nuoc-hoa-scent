package com.example.scent.repo;

import com.example.scent.entity.TraHangNhaSanXuat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TraHangNhaSanXuatInterface extends JpaRepository<TraHangNhaSanXuat, Integer> {
    List<TraHangNhaSanXuat> findByThuongHieuIdAndTrangThaiGui(Integer idThuongHieu, Integer trangThaiGui);
    Optional<TraHangNhaSanXuat> findByYeuCauTraHangId(Integer idYeuCau);
}


