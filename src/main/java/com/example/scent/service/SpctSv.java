package com.example.scent.service;


import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.repo.SanPhamInterface;
import com.example.scent.repo.SpctInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SpctSv {
    @Autowired
    SpctInterface spcti;
@Autowired
    SanPhamInterface sanPhamInterface;

    public List<Spct> getAll() {
        return spcti.findAll();
    }


    public Spct add(Spct spct) {
        return spcti.save(spct);
    }


    public Spct update(Spct spct) {
        return spcti.save(spct);
    }


    public void delete(Integer id) {
        spcti.deleteById(id);
    }


    public Spct detail(Integer id) {
        return spcti.findById(id).get();
    }
    public List<Spct> findByidSanPham(Integer id_san_pham){
        return spcti.findByidSanPham(id_san_pham);
    }
        public void deleteAllSpct(List<Integer> spctsId) {
            spcti.deleteAllById(spctsId);
        }
    public Spct updateTrangThai(Integer id, Integer trangThai) {
        // Tìm Spct theo ID
        Spct spct = spcti.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));

        // Cập nhật trạng thái của Spct
        spct.setTrangThai(trangThai);
        Spct updatedSpct = spcti.save(spct);

        // Lấy ID của Sp từ Spct
        Integer spId = spct.getSanPham().getIdSanPham(); // Giả định Spct có thuộc tính idSanPham

        // Tìm tất cả Spct thuộc cùng Sp
        List<Spct> spctList = spcti.findBySanPhamIdSanPham(spId);

        // Kiểm tra trạng thái của tất cả Spct
        boolean allNgungBan = spctList.stream().allMatch(s -> s.getTrangThai() == 0);
        boolean hasDangBan = spctList.stream().anyMatch(s -> s.getTrangThai() == 1);

        // Tìm Sp tương ứng
        SanPham sp = sanPhamInterface.findById(spId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Cập nhật trạng thái của Sp
        Integer oldSpTrangThai = sp.getTrangThai();
        if (allNgungBan) {
            sp.setTrangThai(0); // Tất cả Spct ngừng bán -> Sp ngừng bán
        } else if (hasDangBan) {
            sp.setTrangThai(1); // Có ít nhất một Spct đang bán -> Sp đang bán
        }

        // Lưu Sp nếu trạng thái thay đổi
        if (!oldSpTrangThai.equals(sp.getTrangThai())) {
            sanPhamInterface.save(sp);
        }

        return updatedSpct;
    }
    public Map<Integer, Integer> getMultipleProductStatuses(List<Integer> idSpcts) {
        List<Spct> products = spcti.findByIdSpctIn(idSpcts);
        Map<Integer, Integer> statusMap = new HashMap<>();
        for (Spct product : products) {
            statusMap.put(product.getSanPham().getIdSanPham(), product.getTrangThai());
        }
        return statusMap;
    }
    public Spct getProductStatus(Integer idSpct) {
        return spcti.findById(idSpct)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + idSpct));
    }
}
