package com.example.scent.service;


import com.example.scent.entity.PhieuGiamGia;
import com.example.scent.entity.SuDungPhieuGiamGia;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.DonHangInterface;
import com.example.scent.repo.PhieuGiamGiaInterface;
import com.example.scent.repo.SuDungPhieuGiamGiaInterface;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.rest.DonHangCtrl;
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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    public List<PhieuGiamGia> getAll() {
        return pggi.findAll();
    }

    public PhieuGiamGia add(PhieuGiamGia phieuGiamGia) {
        if (phieuGiamGia.getNgayBatDau() != null && phieuGiamGia.getNgayHetHan() != null) {
            if (phieuGiamGia.getNgayBatDau().isAfter(phieuGiamGia.getNgayHetHan())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "⚠️ Ngày bắt đầu không được sau ngày kết thúc!");
            }
        }

        // Kiểm tra các điều kiện khác nếu cần (ví dụ: mã giảm giá không được trùng)
        if (pggi.existsByMaGiamGia(phieuGiamGia.getMaGiamGia())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Mã giảm giá đã tồn tại!");
        }
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
            } else {
                phieuGiamGia.setTrangThai(1); // Chưa hết hạn, chuyển thành Hoạt động
                logger.info("Phiếu giảm giá ID: {} chưa hết hạn, cập nhật trạng thái thành Hoạt động", phieuGiamGia.getId());
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
        if (tongGiaTriDonHang == null || phieuGiamGia.getGiaTriDonToiThieu().compareTo(tongGiaTriDonHang) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "⚠️ Tổng giá trị đơn hàng không đủ để áp dụng mã giảm giá này!");
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
