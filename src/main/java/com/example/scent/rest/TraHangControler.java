package com.example.scent.rest;



import com.example.scent.dto.DefectiveProductDTO;
import com.example.scent.entity.LichSuTraHang;
import com.example.scent.entity.YeuCauTraHang;
import com.example.scent.repo.YeuCauTraHangInterface;
import com.example.scent.reques.CustomException;
import com.example.scent.reques.SendToManufacturerRequest;
import com.example.scent.reques.YeuCauTraHangRequest;
import com.example.scent.service.TraHangService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    @Autowired
    private YeuCauTraHangInterface yeuCauTraHangInterface;
    private final ObjectMapper objectMapper;
    // Tạo yêu cầu trả hàng
    public TraHangControler(TraHangService traHangService, ObjectMapper objectMapper) {
        this.traHangService = traHangService;
        this.objectMapper = objectMapper;
    }
    @GetMapping
    public ResponseEntity<Page<YeuCauTraHang>> getAllYeuCauTraHang(Pageable pageable) {
        Page<YeuCauTraHang> yeuCauPage = yeuCauTraHangInterface.findAll(pageable);
        return ResponseEntity.ok(yeuCauPage);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<YeuCauTraHang>> createYeuCauTraHang(
            @RequestPart("yeuCauRequest") String yeuCauRequestJson,
            @RequestPart("idTaiKhoan") String idTaiKhoanStr,
            @RequestPart(value = "hinhAnh", required = false) List<MultipartFile> hinhAnhFiles,
            @RequestPart(value = "video", required = false) List<MultipartFile> videoFiles) throws Exception {

        System.out.println("Nhận được idTaiKhoan: " + idTaiKhoanStr);
        System.out.println("Nhận được yeuCauRequestJson: " + yeuCauRequestJson);
        System.out.println("Số lượng hinhAnhFiles: " + (hinhAnhFiles != null ? hinhAnhFiles.size() : 0));
        System.out.println("Số lượng videoFiles: " + (videoFiles != null ? videoFiles.size() : 0));

        // Parse idTaiKhoan
        Integer idTaiKhoan;
        try {
            idTaiKhoan = Integer.parseInt(idTaiKhoanStr);
        } catch (NumberFormatException e) {
            throw new CustomException(
                    "ID tài khoản không hợp lệ.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TAI_KHOAN_ID"
            );
        }

        // Parse yeuCauRequestJson
        List<YeuCauTraHang> yeuCauList = objectMapper.readValue(yeuCauRequestJson,
                new TypeReference<List<YeuCauTraHang>>() {});

        List<YeuCauTraHang> savedYeuCauList = traHangService.createYeuCauTraHang(yeuCauList, idTaiKhoan, hinhAnhFiles, videoFiles);
        return ResponseEntity.ok(savedYeuCauList);
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
    public ResponseEntity<Page<YeuCauTraHang>> getYeuCauByTinhTrangHang(
            @PathVariable String tinhTrangHang,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<YeuCauTraHang> yeuCauPage = traHangService.getYeuCauByTinhTrangHang(tinhTrangHang, pageable);
        return ResponseEntity.ok(yeuCauPage);
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
