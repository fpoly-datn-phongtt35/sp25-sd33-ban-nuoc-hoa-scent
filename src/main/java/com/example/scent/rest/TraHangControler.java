package com.example.scent.rest;



import com.example.scent.dto.DefectiveProductDTO;
import com.example.scent.entity.LichSuTraHang;
import com.example.scent.entity.YeuCauTraHang;
import com.example.scent.repo.LichSuTraHangInterface;
import com.example.scent.repo.YeuCauTraHangInterface;
import com.example.scent.reques.CustomException;
import com.example.scent.reques.SendToManufacturerRequest;
import com.example.scent.reques.YeuCauTraHangRequest;
import com.example.scent.service.TraHangService;
import com.example.scent.websocket.YeuCauTraHangUpdateDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tra-hang")
public class TraHangControler {
@Autowired
private LichSuTraHangInterface lichSuTraHang;
    @Autowired
    private TraHangService traHangService;
    @Autowired
    private YeuCauTraHangInterface yeuCauTraHangInterface;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    // Tạo yêu cầu trả hàng
    public TraHangControler(TraHangService traHangService, ObjectMapper objectMapper) {
        this.traHangService = traHangService;
        this.objectMapper = objectMapper;
    }
    private void sendWebSocketNotification(YeuCauTraHang yeuCau) {
        if (yeuCau == null || yeuCau.getTaiKhoan() == null || yeuCau.getId() == null || yeuCau.getTrangThai() == null) {
            System.out.println("Cannot send WebSocket notification: YeuCauTraHang or required fields are null");
            return;
        }

        Integer idTaiKhoan = yeuCau.getTaiKhoan().getId();
        YeuCauTraHangUpdateDTO updateDTO = new YeuCauTraHangUpdateDTO(yeuCau.getId(), yeuCau.getTrangThai(), idTaiKhoan);

        // Lấy lý do từ chối từ lịch sử nếu trạng thái là 2 (Từ chối)
        if (yeuCau.getTrangThai() == 2) {
            Optional<LichSuTraHang> latestRejection = lichSuTraHang.findLatestRejectionByYeuCauId(yeuCau.getId());
            updateDTO.setLyDoTuChoi(latestRejection.map(LichSuTraHang::getLyDoTuChoi).orElse(null));
        }

        try {
            messagingTemplate.convertAndSend("/topic/admin/returns", updateDTO);
            messagingTemplate.convertAndSend("/topic/trahang/" + idTaiKhoan, updateDTO);
        } catch (Exception e) {
            System.out.println("Error sending WebSocket notification: " + e.getMessage());
        }
    }
    @GetMapping
    public ResponseEntity<Page<YeuCauTraHang>> getAllYeuCauTraHang(Pageable pageable) {
        Page<YeuCauTraHang> yeuCauPage = yeuCauTraHangInterface.findAll(pageable);
        return ResponseEntity.ok(yeuCauPage);
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> createYeuCauTraHang(
            HttpServletRequest request,
            @RequestPart("yeuCauRequest") String yeuCauRequestJson,
            @RequestPart("idTaiKhoan") String idTaiKhoanStr) throws IOException {
        try {
            System.out.println("Nhận được idTaiKhoan: " + idTaiKhoanStr);
            System.out.println("Nhận được yeuCauRequestJson: " + yeuCauRequestJson);

            Integer idTaiKhoan;
            try {
                idTaiKhoan = Integer.parseInt(idTaiKhoanStr);
            } catch (NumberFormatException e) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "ID tài khoản không hợp lệ.");
                errorResponse.put("errorCode", "INVALID_TAI_KHOAN_ID");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            List<YeuCauTraHang> yeuCauList = objectMapper.readValue(yeuCauRequestJson,
                    new TypeReference<List<YeuCauTraHang>>() {});

            // Lấy tất cả các file từ request
            Map<String, MultipartFile> fileMap = new HashMap<>();
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            for (String paramName : multipartRequest.getFileMap().keySet()) {
                MultipartFile file = multipartRequest.getFile(paramName);
                if (file != null && (file.getContentType() != null && (file.getContentType().startsWith("image/") || file.getContentType().startsWith("video/")))) {
                    fileMap.put(paramName, file);
                    System.out.println("Received file key: " + paramName + ", filename: " + file.getOriginalFilename());
                }
            }

            List<YeuCauTraHang> savedYeuCauList = traHangService.createYeuCauTraHang(yeuCauList, idTaiKhoan, fileMap);
            savedYeuCauList.forEach(this::sendWebSocketNotification); // Gửi thông báo WebSocket
            return ResponseEntity.ok().body(savedYeuCauList);
        } catch (CustomException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("errorCode", e.getErrorCode());
            return ResponseEntity.status(e.getHttpStatus()).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi máy chủ: " + e.getMessage());
            errorResponse.put("errorCode", "INTERNAL_SERVER_ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PutMapping("/{id}/approve")
    public ResponseEntity<YeuCauTraHang> approveYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet) {
        YeuCauTraHang approvedYeuCau = traHangService.approveYeuCauTraHang(id, idTaiKhoanDuyet);
        sendWebSocketNotification(approvedYeuCau);
        return ResponseEntity.ok(approvedYeuCau);
    }

    // Từ chối yêu cầu trả hàng
    @PutMapping("/{id}/reject")
    public ResponseEntity<YeuCauTraHang> rejectYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet, @RequestParam String lyDoTuChoi) {
        YeuCauTraHang rejectedYeuCau = traHangService.rejectYeuCauTraHang(id, idTaiKhoanDuyet, lyDoTuChoi);
        sendWebSocketNotification(rejectedYeuCau);
        return ResponseEntity.ok(rejectedYeuCau);
    }

    // Hoàn thành yêu cầu trả hàng
    @PutMapping("/{id}/complete")
    public ResponseEntity<YeuCauTraHang> completeYeuCauTraHang(@PathVariable Integer id, @RequestParam Integer idTaiKhoanDuyet) {
        YeuCauTraHang completedYeuCau = traHangService.completeYeuCauTraHang(id, idTaiKhoanDuyet);
        sendWebSocketNotification(completedYeuCau);
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
