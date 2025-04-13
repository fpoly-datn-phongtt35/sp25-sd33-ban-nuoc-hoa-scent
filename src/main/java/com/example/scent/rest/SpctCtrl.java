package com.example.scent.rest;

import com.example.scent.dto.SpctDTO;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;

import com.example.scent.repo.SanPhamInterface;
import com.example.scent.service.SpctSv;
import com.example.scent.websocket.SpctMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/spct")
public class SpctCtrl {
    final
    SpctSv spcts;
    @Autowired
    SanPhamInterface sanPhamInterface;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    public SpctCtrl(SpctSv spcts) {
        this.spcts = spcts;
    }

    @GetMapping("/getAll")
    public List<Spct> getAll() {
        return spcts.getAll();
    }

    @PostMapping("/add")
    public Spct create( @RequestBody SpctDTO spctDTO) {
        Spct spct = new Spct();
        spct.setDonGia(spctDTO.getDonGia());
        spct.setSoLuongTonKho(spctDTO.getSoLuongTonKho());
        spct.setDungTich(spctDTO.getDungTich());
        SanPham sanPham = new SanPham();
        sanPham.setIdSanPham(spctDTO.getIdSanPham());
        spct.setSanPham(sanPham);spcts.add(spct);
        spct.setTrangThai(1);
        return spcts.add(spct);
    }
    @PutMapping("/update")
    public Spct update(@RequestBody SpctDTO spctDTO) {
        System.out.println(spctDTO);
        Spct spct = new Spct();
        spct.setIdSpct(spctDTO.getIdSpct());
        spct.setDonGia(spctDTO.getDonGia());
        spct.setSoLuongTonKho(spctDTO.getSoLuongTonKho());
        spct.setDungTich(spctDTO.getDungTich());
        SanPham sanPham = new SanPham();
        sanPham.setIdSanPham(spctDTO.getIdSanPham());
        spct.setSanPham(sanPham);spcts.add(spct);
        spct.setTrangThai(spctDTO.getTrangThai());
        return spcts.update(spct);
    }
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { spcts.delete(id);
    }
    @GetMapping("/getByidSanPham/{id}")
    public List<Spct> findByidSanPham(@PathVariable Integer id){
        return spcts.findByidSanPham(id);
    }
    @PutMapping("/updateTrangThai/{id}")

    public ResponseEntity<Spct> updateSpctTrangThai(@PathVariable Integer id,
                                                    @RequestParam Integer trangThai) {
        try {
            // Cập nhật trạng thái Spct
            Spct updatedSpct = spcts.updateTrangThai(id, trangThai);

            // Gửi thông báo WebSocket cho Spct
            SpctMessage spctMessage = new SpctMessage();
            spctMessage.setIdSpct(updatedSpct.getIdSpct());
            spctMessage.setTrangThai(updatedSpct.getTrangThai());
            messagingTemplate.convertAndSend("/topic/spctUpdates", spctMessage);

            // Kiểm tra và gửi thông báo WebSocket cho Sp nếu trạng thái thay đổi
            Integer spId = updatedSpct.getSanPham().getIdSanPham();
            SanPham sp = sanPhamInterface.findById(spId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            // Giả định rằng SpMessage là một class để gửi thông báo cho Sp
            SpMessage spMessage = new SpMessage();
            spMessage.setId(sp.getIdSanPham());
            spMessage.setTrangThai(sp.getTrangThai());
            messagingTemplate.convertAndSend("/topic/productUpdates", spMessage);

            return ResponseEntity.ok(updatedSpct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null); // Handle "Sản phẩm chi tiết không tồn tại"
        }
    }


    public class SpMessage {
        private Integer id;
        private Integer trangThai;

        // Getters và Setters
        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public Integer getTrangThai() {
            return trangThai;
        }

        public void setTrangThai(Integer trangThai) {
            this.trangThai = trangThai;
        }
        }
}


