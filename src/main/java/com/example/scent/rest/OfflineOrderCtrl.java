package com.example.scent.rest;

import com.example.scent.dto.SPTQDTO;
import com.example.scent.entity.DonHang;
import com.example.scent.reques.OrderOfflineRequest;
import com.example.scent.reques.UpdateOrderStatusRequest;
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
        response.put("message", "Đơn hàng tại quầy đã được tạo thành công với trạng thái tạm thời!");

        return ResponseEntity.ok(response);
    }
    @PutMapping("/status/{orderId}")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody UpdateOrderStatusRequest statusRequest) throws Exception {
        DonHang updatedOrder = createOfflineOrderService.updateOrderStatus(orderId, statusRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", updatedOrder.getId());
        response.put("trangThai", updatedOrder.getTrangThai());
        response.put("message", "Cập nhật trạng thái đơn hàng thành công!");

        // Nếu trạng thái là "Hoàn tất" (4), in hóa đơn
        if (updatedOrder.getTrangThai() == 4) {
            response.put("printInvoice", true); // Gửi tín hiệu để frontend in hóa đơn
        }

        // Nếu trạng thái là "Hủy" (5), trả về lý do hủy
        if (updatedOrder.getTrangThai() == 5) {
            response.put("lyDoHuy", updatedOrder.getLyDoHuy());
        }

        return ResponseEntity.ok(response);
    }
    // Endpoint để cập nhật trạng thái đơn hàng

    @GetMapping("/getAll-sptq")
    public ResponseEntity<List<SPTQDTO>> getAllSPTQ(@RequestParam String keyword) {
        return ResponseEntity.ok(sanPhamSv.getALlSPTQ(keyword));
    }

}
