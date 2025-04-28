package com.example.scent.rest;



import com.example.scent.dto.DefectiveProductDTO;
import com.example.scent.entity.LichSuTraHang;
import com.example.scent.entity.YeuCauTraHang;
import com.example.scent.reques.SendToManufacturerRequest;
import com.example.scent.reques.YeuCauTraHangRequest;
import com.example.scent.service.TraHangService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tra-hang")
public class TraHangControler {

    @Autowired
    private TraHangService traHangService;
    private final ObjectMapper objectMapper;
    // Tạo yêu cầu trả hàng
    public TraHangControler(TraHangService traHangService, ObjectMapper objectMapper) {
        this.traHangService = traHangService;
        this.objectMapper = objectMapper;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<YeuCauTraHang> createYeuCauTraHang(
            @RequestPart("yeuCauRequest") String yeuCauRequestJson,
            @RequestPart(value = "hinhAnh", required = false) List<MultipartFile> hinhAnhFiles,
            @RequestPart(value = "video", required = false) MultipartFile videoFile) throws Exception {

        // Chuyển chuỗi JSON thành YeuCauTraHangRequest
        YeuCauTraHangRequest yeuCauRequest = objectMapper.readValue(yeuCauRequestJson, YeuCauTraHangRequest.class);

        // Kiểm tra null cho yeuCauRequest
        if (yeuCauRequest == null) {
            throw new IllegalArgumentException("Yêu cầu trả hàng không được để trống");
        }

        // Kiểm tra idTaiKhoan
        Integer idTaiKhoan = yeuCauRequest.getIdTaiKhoan();
        if (idTaiKhoan == null) {
            throw new IllegalArgumentException("ID tài khoản không được để trống");
        }

        // Kiểm tra đơn hàng
        if (yeuCauRequest.getDonHang() == null || yeuCauRequest.getDonHang().getId() == null) {
            throw new IllegalArgumentException("Đơn hàng hoặc ID đơn hàng không được để trống");
        }

        // Kiểm tra sản phẩm chi tiết
        if (yeuCauRequest.getSpct() == null || yeuCauRequest.getSpct().getIdSpct() == null) {
            throw new IllegalArgumentException("Sản phẩm chi tiết hoặc ID sản phẩm chi tiết không được để trống");
        }

        // Kiểm tra tình trạng hàng
        if (yeuCauRequest.getTinhTrangHang() == null) {
            throw new IllegalArgumentException("Tình trạng hàng không được để trống");
        }
        if (videoFile != null && videoFile.isEmpty()) {
            throw new IllegalArgumentException("Tệp video không hợp lệ hoặc rỗng");
        }
        // Map YeuCauTraHangRequest thành YeuCauTraHang
        YeuCauTraHang yeuCau = new YeuCauTraHang();
        yeuCau.setDonHang(yeuCauRequest.getDonHang());
        yeuCau.setTaiKhoan(yeuCauRequest.getTaiKhoan());
        yeuCau.setSpct(yeuCauRequest.getSpct());
        yeuCau.setSoLuong(yeuCauRequest.getSoLuong());
        yeuCau.setTrangThai(yeuCauRequest.getTrangThai());
        yeuCau.setLyDoTraHang(yeuCauRequest.getLyDoTraHang());
        yeuCau.setTinhTrangHang(yeuCauRequest.getTinhTrangHang());
        yeuCau.setHinhThucTraHang(yeuCauRequest.getHinhThucTraHang());
        yeuCau.setGhiChu(yeuCauRequest.getGhiChu());


        // Gọi service để tạo yêu cầu trả hàng
        YeuCauTraHang savedYeuCau = traHangService.createYeuCauTraHang(yeuCau, idTaiKhoan, hinhAnhFiles, videoFile);

        // Trả về phản hồi thành công
        return ResponseEntity.ok(savedYeuCau);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<YeuCauTraHang> approveYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet) {
        YeuCauTraHang approvedYeuCau = traHangService.approveYeuCauTraHang(id, idTaiKhoanDuyet);
        return ResponseEntity.ok(approvedYeuCau);
    }

    // Từ chối yêu cầu trả hàng
    @PutMapping("/{id}/reject")
    public ResponseEntity<YeuCauTraHang> rejectYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet, @RequestParam String lyDoTuChoi) {
        YeuCauTraHang rejectedYeuCau = traHangService.rejectYeuCauTraHang(id, idTaiKhoanDuyet, lyDoTuChoi);
        return ResponseEntity.ok(rejectedYeuCau);
    }

    // Hoàn thành yêu cầu trả hàng
    @PutMapping("/{id}/complete")
    public ResponseEntity<YeuCauTraHang> completeYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet) {
        YeuCauTraHang completedYeuCau = traHangService.completeYeuCauTraHang(id, idTaiKhoanDuyet);
        return ResponseEntity.ok(completedYeuCau);
    }
    @GetMapping("/{id}/history")
    public ResponseEntity<List<LichSuTraHang>> getLichSuByYeuCauTraHang(@PathVariable Integer id) {
        List<LichSuTraHang> lichSuList = traHangService.getLichSuByYeuCauTraHang(id);
        if (lichSuList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(lichSuList);
    }
    // Lấy danh sách yêu cầu trả hàng theo tình trạng hàng
    @GetMapping("/tinh-trang/{tinhTrangHang}")
    public ResponseEntity<List<YeuCauTraHang>> getYeuCauByTinhTrangHang(@PathVariable String tinhTrangHang) {
        List<YeuCauTraHang> yeuCauList = traHangService.getYeuCauByTinhTrangHang(tinhTrangHang);
        return ResponseEntity.ok(yeuCauList);
    }
    @GetMapping("/user/{idTaiKhoan}")
    public ResponseEntity<List<YeuCauTraHang>> getYeuCauByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        List<YeuCauTraHang> yeuCauList = traHangService.getYeuCauByTaiKhoan(idTaiKhoan);
        if (yeuCauList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(yeuCauList);
    }
    @GetMapping("/defective-products")
    public ResponseEntity<Page<DefectiveProductDTO>> getDefectiveProducts(
            @RequestParam(value = "brand", required = false) String brand,
            @PageableDefault(size = 16, page = 0) Pageable pageable) {
        Page<DefectiveProductDTO> defectiveProducts = traHangService.getDefectiveProducts(brand, pageable);
        return ResponseEntity.ok(defectiveProducts);
    }

    // Gửi sản phẩm hư hỏng trả nhà sản xuất
    @PostMapping("/send-to-manufacturer")
    public ResponseEntity<Map<String, String>> sendToManufacturer(@RequestBody List<SendToManufacturerRequest> requests) {
        try {
            traHangService.sendToManufacturer(requests);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Gửi trả nhà sản xuất thành công cho tất cả sản phẩm");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
