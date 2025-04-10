package com.example.scent.rest;

import com.example.scent.entity.MuiHuong;
import com.example.scent.entity.NotHuong;
import com.example.scent.entity.PhongCach;
import com.example.scent.entity.SanPham;
import com.example.scent.repo.MuiHuongInterface;
import com.example.scent.repo.NotHuongInterface;
import com.example.scent.repo.PhongCachInterface;
import com.example.scent.repo.SanPhamInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest")
public class HuonghuongCtrl {
    @Autowired
    private PhongCachInterface phongCachInterface;
    @Autowired
    private MuiHuongInterface muiHuongInterface;
    @Autowired
    private NotHuongInterface notHuongInterface;
    @Autowired
    private SanPhamInterface sanPhamInterface;
    @GetMapping("not-huong/getAll")
    public List<NotHuong> getAllNotHuong() {
        return notHuongInterface.findAll();
    }

    @PostMapping("not-huong/add")
    public NotHuong addNotHuong(@RequestBody NotHuong notHuong) {
        return notHuongInterface.save(notHuong);
    }

    @PutMapping("not-huong/updateNotHuongs/{id}")
    public NotHuong updateMuiHuongForNotHuong(@PathVariable Integer id, @RequestBody Integer muiHuongId) {
        NotHuong notHuong = notHuongInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Nốt hương không tồn tại"));
        MuiHuong muiHuong = muiHuongInterface.findById(muiHuongId)
                .orElseThrow(() -> new RuntimeException("Mùi hương không tồn tại"));
        notHuong.setMuiHuong(muiHuong);
        return notHuongInterface.save(notHuong);
    }
    @GetMapping("mui-huong/getAll")
    public List<MuiHuong> getAllMuiHuong() {
        return muiHuongInterface.findAll();
    }
    @PostMapping("mui-huong/add")
    public MuiHuong addMuiHuong(@RequestBody MuiHuong muiHuong) {
        return muiHuongInterface.save(muiHuong);
    }

    @PutMapping("mui-huong/updateMuiHuongs/{id}")
    public MuiHuong updateNotHuongsForMuiHuong(@PathVariable Integer id, @RequestBody List<Integer> notHuongIds) {
        MuiHuong muiHuong = muiHuongInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Mùi hương không tồn tại"));
        List<NotHuong> notHuongs = notHuongInterface.findAllById(notHuongIds);
        // Cập nhật lại quan hệ: gán MuiHuong cho từng NotHuong
        notHuongs.forEach(notHuong -> notHuong.setMuiHuong(muiHuong));
        muiHuong.setNotHuongs(notHuongs);
        return muiHuongInterface.save(muiHuong);
    }
    @GetMapping("phong-cach/getAll")
    public List<PhongCach> getAllPhongCach() {
        return phongCachInterface.findAll();
    }

    @PostMapping("phong-cach/add")
    public PhongCach addPhongCach(@RequestBody PhongCach phongCach) {
        return phongCachInterface.save(phongCach);
    }

    @PutMapping("phong-cach/updatePhongCachs/{id}")
    public PhongCach updateSanPhamsForPhongCach(@PathVariable Integer id, @RequestBody List<Integer> sanPhamIds) {
        PhongCach phongCach = phongCachInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Phong cách không tồn tại"));
        List<SanPham> sanPhams = sanPhamInterface.findAllById(sanPhamIds);
        phongCach.setSanPhams(sanPhams);
        return phongCachInterface.save(phongCach);
    }
}
