package com.example.scent.service;


import com.example.scent.dto.SanPhamInfoDTO;
import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.SuDungPhieuGiamGia;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.*;
import com.example.scent.rest.DonHangCtrl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class PhieuGiamGiaSv {
    private static final Logger logger = LoggerFactory.getLogger(DonHangCtrl.class);
    @Autowired
    PhieuGiamGiaInterface pggi;
    @Autowired
    TaiKhoanInterface taiKhoanInterface;
    @Autowired
    DonHangInterface donHangInterface;
    @Autowired
    SuDungPhieuGiamGiaInterface suDungPhieuGiamGiaInterface;
    @Autowired
    private EmailService emailService;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private SanPhamInterface sanPhamInterface;
    public List<TaiKhoan> getUsersByRole() {
        return taiKhoanInterface.findByVaiTro("user");
    }

    // Thêm phương thức gửi mã giảm giá qua email
    @Transactional
    public Map<String, Object> sendCouponToUser(Integer couponId, Integer userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Kiểm tra phiếu giảm giá
            PhieuGiamGia phieuGiamGia = pggi.findById(couponId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "⚠️ Phiếu giảm giá không tồn tại!"));

            // Kiểm tra khách hàng
            TaiKhoan taiKhoan = taiKhoanInterface.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "⚠️ Tài khoản không tồn tại!"));

            if (!"user".equalsIgnoreCase(taiKhoan.getVaiTro())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Tài khoản không phải là khách hàng!");
            }

            if (taiKhoan.getEmail() == null || taiKhoan.getEmail().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Tài khoản không có email!");
            }

            // Kiểm tra trạng thái phiếu giảm giá
            LocalDateTime now = LocalDateTime.now();
            if (phieuGiamGia.getNgayHetHan() != null && now.isAfter(phieuGiamGia.getNgayHetHan())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Phiếu giảm giá đã hết hạn!");
            }
            if (phieuGiamGia.getSoLuong() != null && phieuGiamGia.getSoLuong() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Phiếu giảm giá đã hết số lượng!");
            }
            if (phieuGiamGia.getTrangThai() != null && phieuGiamGia.getTrangThai() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Phiếu giảm giá đã bị ngưng!");
            }

            // Kiểm tra ngày bắt đầu và ngày hết hạn
            if (phieuGiamGia.getNgayBatDau() == null || phieuGiamGia.getNgayHetHan() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Phiếu giảm giá thiếu ngày bắt đầu hoặc ngày hết hạn!");
            }

            // Gửi email với thời gian bắt đầu và kết thúc
            LocalDate startDate = phieuGiamGia.getNgayBatDau().toLocalDate();
            LocalDate endDate = phieuGiamGia.getNgayHetHan().toLocalDate();
            emailService.sendCouponEmail(
                    taiKhoan.getEmail(),
                    phieuGiamGia.getMaGiamGia(),
                    phieuGiamGia.getGiaTriGiam(),
                    startDate,
                    endDate
            );

            // Giảm số lượng phiếu (nếu có)
            if (phieuGiamGia.getSoLuong() != null) {
                phieuGiamGia.setSoLuong(phieuGiamGia.getSoLuong() - 1);
                pggi.save(phieuGiamGia);
            }

            response.put("status", "success");
            response.put("message", "Gửi mã giảm giá thành công tới email: " + taiKhoan.getEmail());
            return response;

        } catch (ResponseStatusException e) {
            logger.error("Lỗi khi gửi mã giảm giá cho userId {} với couponId {}: {}", userId, couponId, e.getMessage());
            response.put("status", "error");
            response.put("message", e.getReason());
            return response;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi gửi mã giảm giá cho userId {} với couponId {}: {}", userId, couponId, e.getMessage(), e);
            response.put("status", "error");
            response.put("message", "Lỗi: " + e.getMessage());
            return response;
        }
    }
    public List<PhieuGiamGia> getAll() {
        return pggi.findAll();
    }
    public PhieuGiamGia add(PhieuGiamGia phieuGiamGia) {
        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        // Kiểm tra mã giảm giá đã tồn tại chưa
        if (pggi.existsByMaGiamGia(phieuGiamGia.getMaGiamGia())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá đã tồn tại!");
        }

        // Lấy thời gian hiện tại
        LocalDateTime now = LocalDateTime.now(); // Thời gian hiện tại: 18/05/2025, 16:22

        // Xác định trạng thái dựa trên thời gian
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (now.isAfter(phieuGiamGia.getNgayBatDau().minusSeconds(1)) &&
                    now.isBefore(phieuGiamGia.getNgayHetHan().plusSeconds(1))) {
                // Nếu thời gian hiện tại nằm trong khoảng [ngayBatDau, ngayHetHan]
                phieuGiamGia.setTrangThai(1); // Hoạt động
            } else {
                // Nếu thời gian hiện tại nằm ngoài khoảng
                phieuGiamGia.setTrangThai(0); // Ngừng
            }
        } else {
            // Nếu không có ngày bắt đầu hoặc ngày kết thúc, mặc định trạng thái là Ngừng
            phieuGiamGia.setTrangThai(0);
        }

        // Lưu voucher vào DB
        return pggi.save(phieuGiamGia);
    }

    @Transactional
    public PhieuGiamGia update(PhieuGiamGia phieuGiamGia) {
        logger.info("Cập nhật phiếu giảm giá với ID: {}", phieuGiamGia.getId());

        // Kiểm tra xem phiếu có tồn tại không
        if (!pggi.existsById(phieuGiamGia.getId())) {
            logger.error("Phiếu giảm giá với ID {} không tồn tại!", phieuGiamGia.getId());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "⚠️ Mã giảm giá không tồn tại!");
        }
        if (pggi.existsByMaGiamGia(phieuGiamGia.getMaGiamGia())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá đã tồn tại!");
        }
        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                logger.error("Ngày bắt đầu {} không được sau ngày kết thúc {}!",
                        phieuGiamGia.getNgayBatDau(), phieuGiamGia.getNgayHetHan());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        // Cập nhật trạng thái dựa trên ngày hết hạn
        if (phieuGiamGia.getNgayHetHan() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (phieuGiamGia.getNgayHetHan().isBefore(now)) {
                phieuGiamGia.setTrangThai(0); // Đã hết hạn, chuyển thành Ngưng
                logger.info("Phiếu giảm giá ID: {} đã hết hạn, cập nhật trạng thái thành Ngưng", phieuGiamGia.getId());
            }
        } else {
            logger.warn("Ngày hết hạn của phiếu giảm giá ID: {} là null, không cập nhật trạng thái", phieuGiamGia.getId());
        }

        // Lưu phiếu giảm giá đã cập nhật
        PhieuGiamGia updatedVoucher = pggi.save(phieuGiamGia);
        logger.info("Cập nhật thành công phiếu giảm giá với ID: {}, trạng thái: {}",
                updatedVoucher.getId(), updatedVoucher.getTrangThai());
        return updatedVoucher;
    }

    @Transactional
    public void updateTrangThaiOnly(Integer id, Integer trangThai, boolean reset) {
        logger.info("Cập nhật trạng thái phiếu giảm giá với ID: {}, trạng thái: {}, reset: {}", id, trangThai, reset);

        // Kiểm tra xem phiếu có tồn tại không
        PhieuGiamGia phieu = pggi.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "⚠️ Mã giảm giá không tồn tại!"));

        // Nếu reset = true, khôi phục trạng thái tự động
        if (reset) {
            LocalDateTime now = LocalDateTime.now();
            if (phieu.getSoLuong() == 0) {
                phieu.setTrangThai(0); // Ngừng nếu hết số lượng
            } else if (phieu.getNgayBatDau() != null && phieu.getNgayHetHan() != null) {
                if (now.isBefore(phieu.getNgayBatDau()) || now.isAfter(phieu.getNgayHetHan())) {
                    phieu.setTrangThai(0); // Ngừng
                } else {
                    phieu.setTrangThai(1); // Hoạt động
                }
            } else {
                phieu.setTrangThai(0); // Mặc định Ngừng nếu thiếu thông tin thời gian
            }
            logger.info("Khôi phục trạng thái tự động cho phiếu giảm giá ID: {}, trạng thái: {}", id, phieu.getTrangThai());
        } else {
            // Kiểm tra trạng thái hợp lệ
            if (trangThai != 0 && trangThai != 1) {
                logger.error("Trạng thái {} không hợp lệ!", trangThai);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Trạng thái phải là 0 hoặc 1!");
            }

            // Ép trạng thái thành 0 nếu số lượng bằng 0


            // Nếu trạng thái là 0, đánh dấu là "tắt thủ công" (trangThai = 2)
            if (trangThai == 0) {
                phieu.setTrangThai(2); // Tắt thủ công
            } else {
                phieu.setTrangThai(trangThai); // Kích hoạt (trangThai = 1)
            }
        }

        pggi.save(phieu);
        logger.info("Cập nhật trạng thái thành công cho phiếu giảm giá với ID: {}", id);
    }
    public void delete(Integer id) {
        pggi.deleteById(id);
    }
    public Optional<PhieuGiamGia> getDiscountCodeByCode(String code) {
        return pggi.findByMaGiamGia(code);
    }

    public PhieuGiamGia detail(Integer id) {
        return pggi.findById(id).get();
    }
    public Page<PhieuGiamGia> getPagePhieuGiamGia(int page, int size) {
        // Thêm Sort theo id giảm dần
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return pggi.findAll(pageable);
    }
    public Page<PhieuGiamGia> searchByMaGiamGiaAndGiaTriGiam(String maGiamGia, BigDecimal giaTriGiam, Pageable pageable) {
        return pggi.findByMaGiamGiaContainingAndGiaTriGiam(maGiamGia, giaTriGiam, pageable);
    }

    @Transactional(readOnly = true)
    public PhieuGiamGia getDiscountCodeDetails(String code, String sdt, Integer id, BigDecimal tongGiaTriDonHang) {
        logger.info("Checking discount code: code={}, idTaiKhoan={}, sdt={}, tongGiaTriDonHang={}", code, id, sdt, tongGiaTriDonHang);

        PhieuGiamGia phieuGiamGia = pggi.findByMaGiamGia(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Mã giảm giá không tồn tại hoặc không hợp lệ!"));

        LocalDateTime now = LocalDateTime.now();
        if (phieuGiamGia.getNgayBatDau() != null && now.isBefore(phieuGiamGia.getNgayBatDau())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá chưa có hiệu lực!");
        }
        if (phieuGiamGia.getNgayHetHan() != null && now.isAfter(phieuGiamGia.getNgayHetHan())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá đã hết hạn!");
        }

        if (phieuGiamGia.getSoLuong() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Đã hết mã giảm giá!");
        }

        // Kiểm tra giá trị đơn tối thiểu
        if (tongGiaTriDonHang == null || phieuGiamGia.getGiaTriDonToiThieu().compareTo(tongGiaTriDonHang) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Tổng giá trị đơn hàng không đủ để áp dụng mã giảm giá này!");
        }


        String phoneNumberToCheck;
        if (id != null) {
            TaiKhoan taiKhoan = taiKhoanInterface.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "⚠️ Tài khoản không tồn tại!"));
            phoneNumberToCheck = taiKhoan.getSdt();
            if (phoneNumberToCheck == null || phoneNumberToCheck.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Tài khoản không có số điện thoại đăng ký!");
            }
        } else {
            if (sdt == null || sdt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Vui lòng cung cấp số điện thoại để sử dụng mã giảm giá!");
            }
            phoneNumberToCheck = sdt;
        }

        if (!phoneNumberToCheck.matches("^0[0-9]{9}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Số điện thoại không hợp lệ! Phải có 10 chữ số và bắt đầu bằng 0.");
        }

        logger.info("Checking discount code usage for phone number: {}", phoneNumberToCheck);
        Optional<SuDungPhieuGiamGia> usageOpt = suDungPhieuGiamGiaInterface
                .findByPhieuGiamGiaIdAndSdt(phieuGiamGia.getId(), phoneNumberToCheck);
        if (usageOpt.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Số điện thoại này đã sử dụng mã giảm giá này rồi!");
        }

        return phieuGiamGia;
    }
    @Transactional

    public void updateVoucherStatuses() {
        logger.info("Bắt đầu cập nhật trạng thái phiếu giảm giá");

        // Lấy thời gian hiện tại (múi giờ +07)
        LocalDateTime currentTime = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        // Kiểm tra và kích hoạt các voucher đã đến thời gian bắt đầu (trangThai = 0, ngayBatDau <= currentTime)
        List<PhieuGiamGia> pendingVouchers = pggi.findAllByTrangThaiAndNgayBatDauBeforeOrNgayBatDauEquals(0, currentTime, currentTime);
        int activatedCount = 0;
        for (PhieuGiamGia voucher : pendingVouchers) {
            if (currentTime.isBefore(voucher.getNgayHetHan())) { // Đảm bảo chưa hết hạn
                voucher.setTrangThai(1); // Chuyển thành Hoạt động
                pggi.save(voucher);
                activatedCount++;
                logger.info("Tự động kích hoạt voucher: {}", voucher.getMaGiamGia());
            }
        }

        // Kiểm tra và ngưng các voucher hết hạn (trangThai = 1, ngayHetHan < currentTime)
        List<PhieuGiamGia> expiredVouchers = pggi.findAllByTrangThaiAndNgayHetHanBefore(1, currentTime);
        int expiredUpdatedCount = 0;
        for (PhieuGiamGia voucher : expiredVouchers) {
            voucher.setTrangThai(0); // Chuyển thành Ngưng
            pggi.save(voucher);
            expiredUpdatedCount++;
        }

        logger.info("Đã kích hoạt {} phiếu giảm giá", activatedCount);
        logger.info("Đã cập nhật {} phiếu hết hạn thành trạng thái Ngưng", expiredUpdatedCount);
    }public void updateExpiredVouchersStatus(){
        logger.info("Bắt đầu cập nhật trạng thái phiếu giảm giá");

        // Lấy phiếu đang hoạt động (trangThai = 1) và đã hết hạn (ngayHetHan trước hiện tại)
        List<PhieuGiamGia> expiredVouchers = pggi.findAllByTrangThaiAndNgayHetHanBefore(1, LocalDateTime.now());
        int expiredUpdatedCount = 0;

        for (PhieuGiamGia voucher : expiredVouchers) {
            voucher.setTrangThai(0); // Chuyển thành Ngưng
            pggi.save(voucher);
            expiredUpdatedCount++;
        }

        // Lấy phiếu đang ngưng (trangThai = 0) nhưng chưa hết hạn (ngayHetHan sau hiện tại)
        List<PhieuGiamGia> notExpiredVouchers = pggi.findAllByTrangThaiAndNgayHetHanAfter(0, LocalDateTime.now());
        int notExpiredUpdatedCount = 0;

        for (PhieuGiamGia voucher : notExpiredVouchers) {
            voucher.setTrangThai(1); // Chuyển thành Hoạt động
            pggi.save(voucher);
            notExpiredUpdatedCount++;
        }

        logger.info("Đã cập nhật {} phiếu hết hạn thành trạng thái Ngưng", expiredUpdatedCount);
        logger.info("Đã cập nhật {} phiếu chưa hết hạn thành trạng thái Hoạt động", notExpiredUpdatedCount);
    }
    public Map<String, Object> searchVouchers(
            String maGiamGia,
            Double giaTri,
            LocalDateTime ngayBatDau,
            LocalDateTime ngayHetHan,
            Integer soLuong,
            Integer giaTriToiDa,
            Integer giaTriToiThieu,
            Integer trangThai,
            Integer dieuKienapDung,
            int page,
            int size) {

        Map<String, Object> response = new HashMap<>();
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PhieuGiamGia> vouchersPage = pggi.searchVouchers(
                    maGiamGia,
                    giaTri,
                    ngayBatDau,
                    ngayHetHan,
                    soLuong,
                    giaTriToiDa,
                    giaTriToiThieu,
                    trangThai,
                    dieuKienapDung,
                    pageable
            );

            if (vouchersPage.isEmpty()) {
                response.put("status", "success");
                response.put("message", "Không tìm thấy phiếu giảm giá nào!");
                response.put("data", vouchersPage.getContent());
                response.put("totalPages", vouchersPage.getTotalPages());
                response.put("totalElements", vouchersPage.getTotalElements());
                response.put("currentPage", vouchersPage.getNumber());
            } else {
                response.put("status", "success");
                response.put("message", "Tìm kiếm thành công!");
                response.put("data", vouchersPage.getContent());
                response.put("totalPages", vouchersPage.getTotalPages());
                response.put("totalElements", vouchersPage.getTotalElements());
                response.put("currentPage", vouchersPage.getNumber());
            }
            return response;
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi khi tìm kiếm: " + e.getMessage());
            return response;
        }
    }

}
