package com.example.scent.rest;

import com.example.scent.reques.PhiVanChuyenRequest;
import com.example.scent.respone.DiaChiCache;
import com.example.scent.respone.PhiVanChuyenResponse;
import com.example.scent.service.DiaChiApi;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/all/dia-chi")
public class DiaChiCtrl {

    @GetMapping("/get-tinh-thanh")
    public ResponseEntity<?> getThanhPho() throws Exception {
        // Gọi API GHN để lấy tỉnh thành
        Map<Integer, String> tinhList = DiaChiApi.callGetTinhThanhAPI();
        if (tinhList.isEmpty()) {
            throw new RuntimeException("Không có dữ liệu tỉnh thành từ API GHN.");
        }

        // Lưu vào cache
        DiaChiCache.hashMapTinhThanh = tinhList;

        // Trả về kết quả
        HashMap<String, Object> result = new HashMap<>();
        result.put("result", DiaChiCache.hashMapTinhThanh);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/get-quan-huyen/{idThanhPho}")
    public ResponseEntity<?> getQuanHuyen(@PathVariable("idThanhPho") Integer idThanhPho) {
        try {
            // Gọi API GHN để lấy quận huyện theo mã tỉnh
            Map<String, String> quanList = DiaChiApi.callGetQuanHuyenAPI(idThanhPho);

            if (quanList.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu quận huyện cho tỉnh có mã: " + idThanhPho);
            }

            // Trả về kết quả
            HashMap<String, Object> result = new HashMap<>();
            result.put("result", quanList);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy dữ liệu quận huyện: " + e.getMessage());
        }
    }

    // Lấy danh sách phường xã theo mã quận huyện
    @GetMapping("/get-phuong-xa/{idQuanHuyen}")
    public ResponseEntity<?> getPhuongXa(@PathVariable("idQuanHuyen") Integer idQuanHuyen) {
        try {
            // Gọi API GHN để lấy phường xã theo mã quận huyện
            Map<String, String> phuongList = DiaChiApi.callGetPhuongXaAPI(idQuanHuyen);

            if (phuongList.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu phường xã cho quận huyện có mã: " + idQuanHuyen);
            }

            // Trả về kết quả
            HashMap<String, Object> result = new HashMap<>();
            result.put("result", phuongList);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy dữ liệu phường xã: " + e.getMessage());
        }
    }
    @PostMapping("/tinh-phi-van-chuyen")
    public ResponseEntity<?> getPhiVanChuyen(@RequestBody PhiVanChuyenRequest phiVanChuyenRequest) {
        // Kiểm tra các tham số đầu vào
        if (phiVanChuyenRequest.getIdMaTinh() == null ||
                phiVanChuyenRequest.getIdQuanHuyen() == null ||
                phiVanChuyenRequest.getIdPhuongXa() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ Lỗi: Mã tỉnh, quận hoặc phường không được để trống.");
        }

        try {
            // Gọi API tính phí vận chuyển và nhận kết quả là BigDecimal
            BigDecimal fee = DiaChiApi.getFee(phiVanChuyenRequest);

            // Kiểm tra xem phí vận chuyển có hợp lệ không
            if (fee != null && fee.compareTo(BigDecimal.ZERO) > 0) {
                // Trả về phí vận chuyển dưới dạng PhiVanChuyenResponse
                PhiVanChuyenResponse response = new PhiVanChuyenResponse(fee.intValue());
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                // Trả về lỗi nếu phí vận chuyển không hợp lệ
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("⚠️ Lỗi: Không thể tính phí vận chuyển hoặc phí là 0.");
            }
        } catch (Exception e) {
            // Log the error for debugging purposes
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Lỗi hệ thống: " + e.getMessage());
        }
    }

}
