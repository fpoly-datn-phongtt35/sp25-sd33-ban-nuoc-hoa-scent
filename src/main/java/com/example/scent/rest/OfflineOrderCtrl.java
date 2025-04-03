package com.example.scent.rest;

import com.example.scent.dto.SPTQDTO;
import com.example.scent.entity.DonHang;
import com.example.scent.reques.OrderOfflineRequest;
import com.example.scent.service.DonHangSv;
import com.example.scent.service.SanPhamSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rest/offline-orders")
@CrossOrigin("*")
public class OfflineOrderCtrl {
    //    @Autowired
//    private OfflineOrderService offlineOrderService;
    @Autowired
    private SanPhamSv sanPhamSv;
    @Autowired
    private DonHangSv createOfflineOrderService;
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOfflineOrder(@RequestBody OrderOfflineRequest orderRequest) throws Exception {
        DonHang savedOrder = createOfflineOrderService.createOfflineOrderService(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getId());
        response.put("tongTien", savedOrder.getTongTien());
        response.put("message", "Đơn hàng tại quầy đã được tạo thành công!");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAll-sptq")
    public ResponseEntity<List<SPTQDTO>> getAllSPTQ(@RequestParam String keyword) {
        return ResponseEntity.ok(sanPhamSv.getALlSPTQ(keyword));
    }

}
