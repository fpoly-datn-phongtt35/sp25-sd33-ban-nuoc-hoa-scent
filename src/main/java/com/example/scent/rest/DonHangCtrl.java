package com.example.scent.rest;

import com.example.scent.dto.*;
import com.example.scent.entity.*;
import com.example.scent.repo.DonHangInterface;
import com.example.scent.repo.LichSuThaoTacInterface;
import com.example.scent.reques.PhiVanChuyenRequest;
import com.example.scent.service.DiaChiApi;
import com.example.scent.service.DonHangSv;
import com.example.scent.service.JWTSv;
import com.example.scent.service.LichSuThaoTacService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
@RestController
@RequestMapping("/rest/don-hang")
public class DonHangCtrl {
    private static final Logger log = LoggerFactory.getLogger(DonHangCtrl.class);

    @Autowired
    private DonHangInterface donHangInterface;

    @Autowired
    private DiaChiApi diaChiApi;

    @Autowired
    private DonHangSv dhs;

    @Autowired
    private JWTSv jwtSv;

    @Autowired
    private LichSuThaoTacService lichSuThaoTacService;

    @Autowired
    private LichSuThaoTacInterface lichSuThaoTacInterface;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public DonHangCtrl(DonHangSv dhs, SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.dhs = dhs;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @GetMapping(value = "/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<SanPhamThongKeDto>> getProductStatistics(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        List<SanPhamThongKeDto> statistics = dhs.getProductStatistics(year, month);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping(value = "/revenue", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Double> getRevenue(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        Double revenue = dhs.getTotalRevenue(year, month);
        return ResponseEntity.ok(revenue);
    }

    @GetMapping(value = "/getAll", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DonHang>> getAll() {
        List<DonHang> donHangs = dhs.getAll();
        return ResponseEntity.ok(donHangs);
    }

    @PostMapping(value = "/add", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errorsMap = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.add(dh);
        return ResponseEntity.ok("ok");
    }

    @PutMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@Valid @RequestBody DonHang dh, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errorsMap = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errorsMap.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errorsMap);
        }

        dhs.update(dh);
        return ResponseEntity.ok("ok");
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        dhs.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/update-trang-thai-dh/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateStatusToProcessing(@PathVariable Integer id) {
        DonHang donHang = dhs.updateTrangThaiDonHang(id);
        sendWebSocketNotification(donHang);
        return ResponseEntity.ok("Cập nhật trạng thái đơn hàng thành 'Đang xử lý' thành công");
    }

    @GetMapping(value = "/get-don-hang-chua-xu-ly", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DonHang>> getDonHangChoXuLy() {
        List<DonHang> donHangs = dhs.getDonHangByTrangThai(0);
        return ResponseEntity.ok(donHangs);
    }

    @GetMapping(value = "/get-don-hang-dang-xu-ly", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DonHang>> getDonHangDangXuLy() {
        List<DonHang> donHangs = dhs.getDonHangByTrangThai(1);
        return ResponseEntity.ok(donHangs);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<DonHang> createOrder(@RequestBody DonHangDTO orderRequest) {
        try {
            DonHang createdOrder = dhs.createOrder(orderRequest);
            sendWebSocketNotification(createdOrder);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/page", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DonHang>> getDonHangs(
            @RequestParam(required = false, defaultValue = "-1") int trangThai) {
        List<DonHang> donHangs = dhs.getDonHangByStatus(trangThai);
        return ResponseEntity.ok(donHangs);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<donhangDetailDTO>> getDonHangDetails(@PathVariable Integer id) {
        List<donhangDetailDTO> details = dhs.getDonHangDetailsById(id);
        if (details != null && !details.isEmpty()) {
            return ResponseEntity.ok(details);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping(value = "/user/{idTaiKhoan}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<donhangDTOID>> getDonHangsByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        List<donhangDTOID> donHangs = dhs.getDonHangsByTaiKhoan(idTaiKhoan);
        if (donHangs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(donHangs);
    }

    @PutMapping(value = "/capnhat-tu-dong/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> capNhatTuDongTheoPhuongThuc(@PathVariable Integer id) {
        try {
            DonHang donHang = dhs.detail(id);
            if (donHang == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng với ID: " + id);
            }

            String ptThanhToan = donHang.getPhuongThucThanhToan();
            int trangThaiHienTai = donHang.getTrangThai();
            int trangThaiMoi = trangThaiHienTai;

            boolean isChuyenKhoan = ptThanhToan != null && ptThanhToan.toLowerCase().contains("ck");

            if (trangThaiHienTai == 1 && isChuyenKhoan) {
                trangThaiMoi = 6; // Chuyển khoản → sang "Đã thanh toán"
            } else if (trangThaiHienTai == 1 && !isChuyenKhoan) {
                trangThaiMoi = 2; // Tiền mặt → sang "Đã xác nhận"
            } else if (trangThaiHienTai == 2) {
                trangThaiMoi = 3; // → "Đang giao"
            } else if (trangThaiHienTai == 3) {
                trangThaiMoi = 4; // → "Đã hoàn thành"
            } else if (trangThaiHienTai == 6) {
                trangThaiMoi = 3; // CK: từ "Đã thanh toán" → "Đang giao"
            }

            DonHang updated = dhs.capNhatTrangThaiDonHang(id, trangThaiMoi, null);
            sendWebSocketNotification(updated);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error auto-updating order status for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi cập nhật tự động: " + e.getMessage());
        }
    }

    @PutMapping(value = "/update-trangthai-choxuli/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateDonHangInfo(
            @PathVariable Integer id,
            @RequestParam(required = false) String tenNguoiNhanHang,
            @RequestParam(required = false) String diaChiGiaoHang,
            @RequestParam(required = false) String sdtNguoiNhan,
            @RequestParam(required = false) String emailNguoiNhan,
            @RequestParam(required = false) BigDecimal tongTien,
            @RequestParam(required = false) Integer maTinh,
            @RequestParam(required = false) Integer maQuan,
            @RequestParam(required = false) String maPhuong,
            @RequestParam(required = false) BigDecimal phiVanChuyen) {
        try {
            DonHang updatedDonHang = dhs.updateDonHang(id, tenNguoiNhanHang, diaChiGiaoHang, sdtNguoiNhan,
                    emailNguoiNhan, tongTien, maTinh, maQuan, maPhuong, phiVanChuyen);
            sendWebSocketNotification(updatedDonHang);
            return ResponseEntity.ok(updatedDonHang);
        } catch (Exception e) {
            log.error("Error updating order info for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping(value = "/huy/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Integer orderId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isUpdated = dhs.updateOrderStatusToCancelled(orderId);
            if (isUpdated) {
                DonHang donHang = dhs.detail(orderId);
                sendWebSocketNotification(donHang);
                response.put("status", "success");
                response.put("message", "Đơn hàng đã được huỷ.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Trạng thái không hợp lệ để huỷ.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error cancelling order ID {}: {}", orderId, e.getMessage(), e);
            response.put("status", "error");
            response.put("message", "Lỗi trong quá trình xử lý: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/capnhat-trangthai/{maDonHang}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Integer maDonHang,
            @RequestParam(required = false) String ghiChu,
            @RequestParam(required = false) String lyDoHuy,
            @RequestParam Integer userID,
            @RequestParam String tenDangNhap,
            @RequestParam(required = false) Integer trangThai) {
        try {
            log.info("API /capnhat-trangthai/{} called by user: userID={}, tenDangNhap={}",
                    maDonHang, userID, tenDangNhap);

            if (userID == null || tenDangNhap == null || tenDangNhap.trim().isEmpty()) {
                log.warn("Invalid userID or tenDangNhap: userID={}, tenDangNhap={}", userID, tenDangNhap);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("userID hoặc tên đăng nhập không hợp lệ");
            }

            DonHang donHang = dhs.detail(maDonHang);
            if (donHang == null) {
                log.warn("Order not found with ID: {}", maDonHang);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy đơn hàng với ID: " + maDonHang);
            }

            Integer trangThaiMoi = determineNewStatus(donHang, trangThai, lyDoHuy);

            Integer trangThaiCu = donHang.getTrangThai();
            if (trangThaiMoi == 5 && trangThaiCu == 3) {
                if (lyDoHuy == null || lyDoHuy.trim().isEmpty()) {
                    log.warn("Cancellation reason required when cancelling from status 3 to 5");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Lý do hủy không thể trống khi hủy đơn hàng từ trạng thái Đang Giao!");
                }
                donHang.setLyDoHuy(lyDoHuy);
                log.info("Set cancellation reason: {}", lyDoHuy);
            } else if (trangThaiMoi != 5) {
                donHang.setLyDoHuy(null);
                log.info("No cancellation reason needed, set lyDoHuy to null");
            }

            String ghiChuHuy = (lyDoHuy != null && !lyDoHuy.isEmpty()) ? lyDoHuy : ghiChu;
            log.info("Updating order {}: new status={}, ghiChuHuy={}, by userID={}, tenDangNhap={}",
                    maDonHang, trangThaiMoi, ghiChuHuy, userID, tenDangNhap);
            DonHang updatedDonHang = dhs.capNhatTrangThaiDonHang(maDonHang, trangThaiMoi, userID, tenDangNhap, ghiChuHuy);

            sendWebSocketNotification(updatedDonHang);

            return ResponseEntity.ok(updatedDonHang);
        } catch (Exception e) {
            log.error("Error updating order status for ID {}: {}", maDonHang, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xử lý: " + e.getMessage());
        }
    }

    @GetMapping(value = "/lichsu/{maDonHang}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LichSuThaoTac>> getLichSuDonHang(@PathVariable Integer maDonHang) {
        List<LichSuThaoTac> lichSu = lichSuThaoTacInterface.findByMaDonHang(maDonHang);
        return ResponseEntity.ok(lichSu);
    }

    @GetMapping(value = "/lich-su-thao-tac-by-user", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LichSuThaoTac>> getAllLichSuThaoTac() {
        List<LichSuThaoTac> result = lichSuThaoTacService.getAllLichSuThaoTac();
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/by-don-hang/{maDonHang}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LichSuThaoTac>> getLichSuThaoTacByMaDonHang(@PathVariable Integer maDonHang) {
        List<LichSuThaoTac> lichSu = lichSuThaoTacService.getLichSuThaoTacByMaDonHang(maDonHang);
        return ResponseEntity.ok(lichSu);
    }

    @GetMapping(value = "/diachi/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getOrderById(@PathVariable Integer orderId) {
        try {
            DonHangResponseDTO responseDTO = dhs.getOrderById(orderId);
            if (responseDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy đơn hàng với ID: " + orderId);
            }
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error fetching order by ID {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping(value = "/latest/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<thongtinFillDTO> getLatestOrderByTaiKhoan(@PathVariable Integer id) {
        log.info("Fetching latest order for idTaiKhoan: {}", id);

        DonHang latestOrder = donHangInterface.findTopByTaiKhoanIdOrderByNgayTaoDesc(id)
                .orElse(null);

        if (latestOrder == null) {
            log.info("No order found for idTaiKhoan: {}", id);
            return ResponseEntity.ok(null);
        }

        thongtinFillDTO thongTinFillDTO = new thongtinFillDTO();
        thongTinFillDTO.setIdTaiKhoan(latestOrder.getTaiKhoan().getId());
        thongTinFillDTO.setTenNguoiNhanHang(latestOrder.getTenNguoiNhanHang());
        thongTinFillDTO.setDiaChiGiaoHang(latestOrder.getDiaChiGiaoHang());
        thongTinFillDTO.setSdtNguoiNhan(latestOrder.getSdtNguoiNhan());

        BigDecimal phiVanChuyen = calculateShippingFee(latestOrder);
        thongTinFillDTO.setPhiVanChuyen(phiVanChuyen);

        log.info("Returning latest order: {}", thongTinFillDTO);
        return ResponseEntity.ok(thongTinFillDTO);
    }

    private BigDecimal calculateShippingFee(DonHang order) {
        if (order.getMaQuan() == null || order.getMaPhuong() == null) {
            log.warn("Cannot calculate shipping fee: Missing maQuan or maPhuong for order ID: {}", order.getId());
            return BigDecimal.ZERO;
        }

        int soLuongSanPham = order.getChiTietDonHangs() != null
                ? order.getChiTietDonHangs().stream()
                .mapToInt(ChiTietDonHang::getSoLuong)
                .sum()
                : 0;

        if (soLuongSanPham == 0) {
            log.warn("Cannot calculate shipping fee: No products in order ID: {}", order.getId());
            return BigDecimal.ZERO;
        }

        PhiVanChuyenRequest phiVanChuyenRequest = new PhiVanChuyenRequest();
        phiVanChuyenRequest.setIdQuanHuyen(order.getMaQuan());
        phiVanChuyenRequest.setStringPhuongXa(String.valueOf(order.getMaPhuong()));
        phiVanChuyenRequest.setSoLuongSanPham(soLuongSanPham);

        int trungBinhCacCanh = order.getTrungBinhCacCanh() != null ? order.getTrungBinhCacCanh() : 20;
        phiVanChuyenRequest.setTrungBinhCacCanh(trungBinhCacCanh);

        log.info("Calculating shipping fee for order ID: {} with request: {}", order.getId(), phiVanChuyenRequest);

        try {
            BigDecimal phiVanChuyen = diaChiApi.getFee(phiVanChuyenRequest);
            if (phiVanChuyen == null || phiVanChuyen.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Invalid shipping fee returned for order ID: {}. Fee: {}", order.getId(), phiVanChuyen);
                return BigDecimal.ZERO;
            }
            return phiVanChuyen;
        } catch (Exception e) {
            log.error("Error calculating shipping fee for order ID: {}. Error: {}", order.getId(), e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }

    private Integer determineNewStatus(DonHang donHang, Integer trangThai, String lyDoHuy) {
        if (trangThai != null) {
            log.info("Using provided status: {}", trangThai);
            return trangThai;
        }
        Integer trangThaiCu = donHang.getTrangThai();
        Integer trangThaiMoi = dhs.tinhTrangThaiMoi(trangThaiCu, donHang.getPhuongThucThanhToan(), lyDoHuy);
        log.info("Calculated new status: trangThaiCu={}, trangThaiMoi={}", trangThaiCu, trangThaiMoi);
        return trangThaiMoi;
    }
    private void sendWebSocketNotification(DonHang donHang) {
        if (donHang == null || donHang.getTaiKhoan() == null || donHang.getId() == null || donHang.getTrangThai() == null) {
            log.warn("Cannot send WebSocket notification: DonHang or required fields are null");
            return;
        }

        // Create DTO to send order information
        DonHangUpdateDTO updateDTO = new DonHangUpdateDTO(donHang.getId(), donHang.getTrangThai());
        updateDTO.setIsNewOrder(true); // Mark as a new order

        try {
            String payload = objectMapper.writeValueAsString(updateDTO);
            log.info("Preparing to send WebSocket notification to /topic/admin/orders: {}", payload);

            // Send notification to a topic for admins
            messagingTemplate.convertAndSend("/topic/admin/orders", updateDTO);
            log.info("Sent WebSocket notification to /topic/admin/orders: {}", payload);

            // Optionally, still notify the user who placed the order
            Integer idTaiKhoan = donHang.getTaiKhoan().getId();
            log.info("Preparing to send WebSocket notification to /topic/donhang/{}: {}", idTaiKhoan, payload);
            messagingTemplate.convertAndSend("/topic/donhang/" + idTaiKhoan, updateDTO);
            log.info("Sent WebSocket notification to /topic/donhang/{}: {}", idTaiKhoan, payload);
        } catch (Exception e) {
            log.error("Error sending WebSocket notification: {}", e.getMessage(), e);
        }
    }
    @GetMapping("getByIdTaiKhoan/{idTaiKhoan}")
    public List<DonHang> getOderByIdTaiKhoan(@PathVariable Integer idTaiKhoan) {
        return dhs.findByIdTk(idTaiKhoan);
    }

    @PutMapping("/update-address/{orderId}")
    public ResponseEntity<DonHangResponseDTO> updateOrderAddress(
            @PathVariable Integer orderId,
            @RequestBody UpdateOrderAddressDTO updateRequest) {
        try {
            DonHangResponseDTO responseDTO = dhs.updateOrderAddress(orderId, updateRequest);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    @GetMapping(value = "/user/{idTaiKhoan}/completed-orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<donhangDTOID>> getCompletedDonHangsByTaiKhoan(@PathVariable Integer idTaiKhoan) {
        // Lấy tất cả đơn hàng của tài khoản
        List<donhangDTOID> donHangs = dhs.getDonHangsByTaiKhoan(idTaiKhoan);

        // Lấy danh sách id_spct đã yêu cầu trả hàng từ bảng yeu_cau_tra_hang
        Set<Integer> requestedSpctIds = new HashSet<>(dhs.getRequestedSpctIds()); // Chuyển thành Set để tối ưu hiệu suất

        // Lấy thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();

        // Lọc và xử lý từng đơn hàng
        List<donhangDTOID> completedDonHangs = donHangs.stream()
                .filter(donHang -> {
                    // Kiểm tra trạng thái hoàn thành
                    if (donHang.getTrangThai() != 4) {
                        return false;
                    }

                    // Kiểm tra chiTietDonHangs có tồn tại không
                    if (donHang.getChiTietDonHangs() == null || donHang.getChiTietDonHangs().isEmpty()) {
                        return false;
                    }

                    // Lọc các OrderItemDTOID chưa bị yêu cầu trả hàng
                    List<OrderItemDTOID> filteredChiTietDonHangs = donHang.getChiTietDonHangs().stream()
                            .filter(item -> !requestedSpctIds.contains(item.getSpctId())) // Chỉ giữ các item chưa yêu cầu trả hàng
                            .collect(Collectors.toList());

                    // Nếu không còn item nào sau khi lọc, bỏ qua đơn hàng
                    if (filteredChiTietDonHangs.isEmpty()) {
                        return false;
                    }

                    // Cập nhật lại chiTietDonHangs của đơn hàng
                    donHang.setChiTietDonHangs(filteredChiTietDonHangs);

                    // Kiểm tra thời gian
                    LocalDateTime ngayTao = donHang.getNgayTao();
                    long daysBetween = ChronoUnit.DAYS.between(ngayTao, now);

                    if (donHang.getLuongBan() == 0) { // Đơn hàng offline
                        return daysBetween <= 2 && daysBetween >= 0; // Trong vòng 2 ngày
                    } else if (donHang.getLuongBan() == 1) { // Đơn hàng online
                        return daysBetween <= 7 && daysBetween >= 0; // Trong vòng 7 ngày
                    }
                    return false; // Nếu luongBan không hợp lệ, bỏ qua
                })
                .collect(Collectors.toList());

        if (completedDonHangs.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(completedDonHangs);
    }
}