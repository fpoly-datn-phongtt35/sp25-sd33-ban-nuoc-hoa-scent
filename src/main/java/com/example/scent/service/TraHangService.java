package com.example.scent.service;

import com.example.scent.dto.DefectiveProductDTO;
import com.example.scent.entity.*;

import com.example.scent.repo.*;
import com.example.scent.reques.CustomException;
import com.example.scent.reques.SendToManufacturerRequest;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TraHangService {

    @Autowired
    private YeuCauTraHangInterface yeuCauTraHangRepo;

    @Autowired
    private LichSuTraHangInterface lichSuTraHangRepo;

    @Autowired
    private TraHangNhaSanXuatInterface traHangNhaSanXuatRepo;

    @Autowired
    private DonHangInterface donHangRepo;

    @Autowired
    private CTDHInterface chiTietDonHangRepo;

    @Autowired
    private TaiKhoanInterface taiKhoanRepo;

    @Autowired
    private SanPhamInterface sanPhamRepo;

    @Autowired
    private SpctInterface spctRepo;

    @Autowired
    private StorageService storageService;

    public Page<DefectiveProductDTO> getDefectiveProducts(String brand, Pageable pageable) {
        Page<Object[]> results = yeuCauTraHangRepo.findDefectiveProductsGroupedBySpct(brand, pageable);

        List<DefectiveProductDTO> defectiveProducts = new ArrayList<>();
        for (Object[] result : results.getContent()) {
            DefectiveProductDTO dto = new DefectiveProductDTO();
            dto.setIdYeuCau((Integer) result[0]);
            dto.setIdSpct((Integer) result[1]);
            dto.setSoLuong(((Number) result[2]).intValue());
            dto.setTinhTrangHang((String) result[3]);
            dto.setTenSanPham((String) result[4]);
            dto.setTenThuongHieu((String) result[5]);
            dto.setIdThuongHieu((Integer) result[6]);
            dto.setLyDoTraHang((String) result[7]);
            dto.setImageUrl((String) result[8]); // Map the image URL
            dto.setDungTich((Integer) result[9]);
            dto.setDonGia((BigDecimal) result[10]);
            defectiveProducts.add(dto);
        }

        return new PageImpl<>(defectiveProducts, pageable, results.getTotalElements());
    }
    @Transactional
    public void sendToManufacturer(List<SendToManufacturerRequest> requests) {
        for (SendToManufacturerRequest request : requests) {
            Integer idYeuCau = request.getIdYeuCau();
            Integer idSpct = request.getIdSpct();
            Integer soLuongGui = request.getSoLuongGui();
            Integer idThuongHieu = request.getIdThuongHieu();
            String ghiChu = request.getGhiChu();

            // Tìm yêu cầu trả hàng
            YeuCauTraHang yeuCau = yeuCauTraHangRepo.findById(idYeuCau)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu trả hàng với ID: " + idYeuCau));

            // Kiểm tra idSpct và số lượng
            if (!yeuCau.getSpct().getIdSpct().equals(idSpct) || yeuCau.getSoLuong() < soLuongGui) {
                throw new RuntimeException("Sản phẩm hoặc số lượng không hợp lệ cho yêu cầu ID: " + idYeuCau);
            }

            // Tạo bản ghi trả hàng nhà sản xuất
            TraHangNhaSanXuat traHang = new TraHangNhaSanXuat();
            traHang.setYeuCauTraHang(yeuCau);
            traHang.setThuongHieu(new ThuongHieu());
            traHang.getThuongHieu().setId(idThuongHieu);
            traHang.setNgayGuiTra(LocalDateTime.now());
            traHang.setTrangThaiGui(1); // Đã gửi
            traHang.setGhiChu(ghiChu);
            traHangNhaSanXuatRepo.save(traHang);

            // Trừ số lượng trong yêu cầu trả hàng
            yeuCau.setSoLuong(yeuCau.getSoLuong() - soLuongGui);
            if (yeuCau.getSoLuong() == 0) {
                yeuCau.setTrangThai(3); // Hoàn thành nếu hết số lượng
            }
            yeuCauTraHangRepo.save(yeuCau);
        }
    }
    public List<YeuCauTraHang> getYeuCauByTaiKhoan(Integer idTaiKhoan) {
        if (idTaiKhoan == null) {
            throw new CustomException(
                    "Vui lòng cung cấp ID tài khoản hợp lệ.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TAI_KHOAN_ID"
            );
        }
        return yeuCauTraHangRepo.findByTaiKhoanId(idTaiKhoan);
    }

    private double getVideoDuration(File videoFile) throws Exception {
        FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoFile);
        grabber.start();
        double duration = grabber.getLengthInTime() / 1000000.0; // Chuyển từ micro giây sang giây
        grabber.stop();
        grabber.release();
        return duration;
    }

    public List<LichSuTraHang> getLichSuByYeuCauTraHang(Integer idYeuCau) {
        if (idYeuCau == null) {
            throw new CustomException(
                    "Vui lòng cung cấp ID yêu cầu trả hàng hợp lệ.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_YEU_CAU_ID"
            );
        }
        return lichSuTraHangRepo.findByYeuCauTraHangId(idYeuCau);
    }

    public boolean isEligibleForReturn(DonHang donHang, YeuCauTraHang yeuCau) {
        LocalDateTime ngayTaoDonHang = donHang.getNgayTao();
        LocalDateTime ngayYeuCau = yeuCau.getNgayYeuCau();
        Integer loaiDonHang = donHang.getLuongBan();

        if (loaiDonHang == 0) { // Offline
            return ngayYeuCau.isBefore(ngayTaoDonHang.plusDays(2));
        } else if (loaiDonHang == 1) { // Online
            return ngayYeuCau.isBefore(ngayTaoDonHang.plusDays(7));
        }
        return false;
    }

    private void validateSoLuongTraHang(YeuCauTraHang yeuCau, Integer idTaiKhoan) {
        if (yeuCau.getDonHang() == null || yeuCau.getSpct() == null) {
            throw new CustomException(
                    "Thông tin đơn hàng hoặc sản phẩm không hợp lệ. Vui lòng kiểm tra lại.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_DON_HANG_OR_SPCT"
            );
        }

        Integer idDonHang = yeuCau.getDonHang().getId();
        Integer idSpctFromRequest = yeuCau.getSpct().getIdSpct();

        if (idSpctFromRequest == null) {
            throw new CustomException(
                    "Vui lòng cung cấp ID sản phẩm chi tiết hợp lệ.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_SPCT_ID"
            );
        }

        List<DonHang> donHangs = donHangRepo.findByTaiKhoanId(idTaiKhoan);
        if (donHangs.isEmpty()) {
            throw new CustomException(
                    "Tài khoản của bạn chưa có đơn hàng nào.",
                    HttpStatus.BAD_REQUEST,
                    "NO_ORDERS_FOUND"
            );
        }

        Optional<DonHang> donHangOpt = donHangs.stream()
                .filter(dh -> dh.getId().equals(idDonHang))
                .findFirst();
        if (donHangOpt.isEmpty()) {
            throw new CustomException(
                    "Đơn hàng này không thuộc tài khoản của bạn.",
                    HttpStatus.BAD_REQUEST,
                    "ORDER_NOT_BELONG_TO_USER"
            );
        }

        List<ChiTietDonHang> chiTietDonHangs = chiTietDonHangRepo.findByDonHangId(idDonHang);
        if (chiTietDonHangs.isEmpty()) {
            throw new CustomException(
                    "Đơn hàng không có sản phẩm nào để trả.",
                    HttpStatus.BAD_REQUEST,
                    "NO_ORDER_DETAILS"
            );
        }

        Optional<ChiTietDonHang> chiTietOpt = chiTietDonHangs.stream()
                .filter(ct -> idSpctFromRequest.equals(ct.getSpct().getIdSpct()))
                .findFirst();

        if (chiTietOpt.isEmpty()) {
            throw new CustomException(
                    "Sản phẩm này không có trong đơn hàng. Vui lòng kiểm tra lại.",
                    HttpStatus.BAD_REQUEST,
                    "SPCT_NOT_IN_ORDER"
            );
        }

        if (yeuCau.getSoLuong() == null || yeuCau.getSoLuong() <= 0) {
            throw new CustomException(
                    "Số lượng trả hàng không hợp lệ. Vui lòng nhập số lượng lớn hơn 0.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_SO_LUONG"
            );
        }

        if (yeuCau.getSoLuong() > chiTietOpt.get().getSoLuong()) {
            throw new CustomException(
                    "Số lượng trả hàng vượt quá số lượng bạn đã mua. Vui lòng kiểm tra lại.",
                    HttpStatus.BAD_REQUEST,
                    "SO_LUONG_EXCEEDS_PURCHASE"
            );
        }
    }

    public YeuCauTraHang createYeuCauTraHang(YeuCauTraHang yeuCau, Integer idTaiKhoan, List<MultipartFile> hinhAnhFiles, MultipartFile videoFile) {
        if (idTaiKhoan == null) {
            throw new CustomException(
                    "Vui lòng đăng nhập để tạo yêu cầu trả hàng.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TAI_KHOAN_ID"
            );
        }
        if (yeuCau.getDonHang() == null || yeuCau.getDonHang().getId() == null) {
            throw new CustomException(
                    "Vui lòng chọn đơn hàng hợp lệ để trả hàng.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_DON_HANG"
            );
        }
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepo.findById(idTaiKhoan);
        if (taiKhoanOpt.isEmpty() || !taiKhoanOpt.get().getVaiTro().equals("USER")) {
            throw new CustomException(
                    "Chỉ khách hàng mới có thể tạo yêu cầu trả hàng.",
                    HttpStatus.FORBIDDEN,
                    "UNAUTHORIZED_USER"
            );
        }

        Optional<DonHang> donHangOpt = donHangRepo.findById(yeuCau.getDonHang().getId());
        if (donHangOpt.isEmpty()) {
            throw new CustomException(
                    "Đơn hàng không tồn tại. Vui lòng kiểm tra lại.",
                    HttpStatus.NOT_FOUND,
                    "DON_HANG_NOT_FOUND"
            );
        }

        validateSoLuongTraHang(yeuCau, idTaiKhoan);

        DonHang donHang = donHangOpt.get();
        if (!isEligibleForReturn(donHang, yeuCau)) {
            throw new CustomException(
                    "Yêu cầu trả hàng đã vượt quá thời gian cho phép. Vui lòng liên hệ hỗ trợ.",
                    HttpStatus.BAD_REQUEST,
                    "RETURN_TIME_EXCEEDED"
            );
        }

        if (yeuCau.getTinhTrangHang().equals("HuHong")) {
            if (hinhAnhFiles == null || hinhAnhFiles.isEmpty()) {
                throw new CustomException(
                        "Vui lòng cung cấp ít nhất một hình ảnh minh chứng cho sản phẩm hỏng.",
                        HttpStatus.BAD_REQUEST,
                        "MISSING_HINH_ANH"
                );
            }
            if (hinhAnhFiles.size() > 2) {
                throw new CustomException(
                        "Chỉ được phép tải lên tối đa 2 hình ảnh minh chứng.",
                        HttpStatus.BAD_REQUEST,
                        "TOO_MANY_HINH_ANH"
                );
            }
            if (videoFile == null || videoFile.isEmpty()) {
                throw new CustomException(
                        "Vui lòng cung cấp một video minh chứng cho sản phẩm hỏng.",
                        HttpStatus.BAD_REQUEST,
                        "MISSING_VIDEO"
                );
            }

            for (MultipartFile file : hinhAnhFiles) {
                String contentType = file.getContentType();
                if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                    throw new CustomException(
                            "Hình ảnh phải có định dạng JPEG hoặc PNG.",
                            HttpStatus.BAD_REQUEST,
                            "INVALID_IMAGE_FORMAT"
                    );
                }
                if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                    throw new CustomException(
                            "Kích thước hình ảnh không được vượt quá 5MB.",
                            HttpStatus.BAD_REQUEST,
                            "IMAGE_SIZE_EXCEEDED"
                    );
                }
            }

            String videoContentType = videoFile.getContentType();
            if (!"video/mp4".equals(videoContentType)) {
                throw new CustomException(
                        "Video phải có định dạng MP4.",
                        HttpStatus.BAD_REQUEST,
                        "INVALID_VIDEO_FORMAT"
                );
            }
            if (videoFile.getSize() > 50 * 1024 * 1024) { // 50MB
                throw new CustomException(
                        "Kích thước video không được vượt quá 50MB.",
                        HttpStatus.BAD_REQUEST,
                        "VIDEO_SIZE_EXCEEDED"
                );
            }
        } else if (yeuCau.getTinhTrangHang().equals("NguyenVen")) {
            if (hinhAnhFiles != null && hinhAnhFiles.size() > 2) {
                throw new CustomException(
                        "Chỉ được phép tải lên tối đa 2 hình ảnh minh chứng.",
                        HttpStatus.BAD_REQUEST,
                        "TOO_MANY_HINH_ANH"
                );
            }
            if (videoFile != null && !videoFile.isEmpty()) {
                throw new CustomException(
                        "Không cần cung cấp video cho sản phẩm nguyên vẹn.",
                        HttpStatus.BAD_REQUEST,
                        "UNNECESSARY_VIDEO"
                );
            }
        } else {
            throw new CustomException(
                    "Tình trạng hàng không hợp lệ. Vui lòng chọn 'Nguyên vẹn' hoặc 'Hỏng'.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TINH_TRANG_HANG"
            );
        }

        List<String> hinhAnhUrls = new ArrayList<>();
        if (hinhAnhFiles != null && !hinhAnhFiles.isEmpty()) {
            for (MultipartFile file : hinhAnhFiles) {
                try {
                    String imageUrl = storageService.uploadImageToStorage(file);
                    hinhAnhUrls.add(imageUrl);
                } catch (IOException e) {
                    throw new CustomException(
                            "Lỗi khi tải lên hình ảnh. Vui lòng thử lại.",
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "IMAGE_UPLOAD_FAILED"
                    );
                }
            }
        }
        yeuCau.setHinhAnhUrls(hinhAnhUrls);

        String videoUrl = null;
        File videoTempFile = null;
        if (videoFile != null && !videoFile.isEmpty()) {
            try {
                videoTempFile = File.createTempFile("video", ".mp4");
                videoFile.transferTo(videoTempFile);

                if (yeuCau.getTinhTrangHang().equals("HuHong")) {
                    double duration = getVideoDuration(videoTempFile);
                    if (duration < 5 || duration > 15) {
                        throw new CustomException(
                                "Video minh chứng phải có độ dài từ 5 đến 15 giây.",
                                HttpStatus.BAD_REQUEST,
                                "INVALID_VIDEO_DURATION"
                        );
                    }
                }

                videoUrl = storageService.uploadVideoToStorageFromFile(videoTempFile, videoFile.getOriginalFilename());
                yeuCau.setUrlVideo(videoUrl);
            } catch (Exception e) {
                throw new CustomException(
                        "Lỗi khi xử lý video. Vui lòng thử lại.",
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "VIDEO_UPLOAD_FAILED"
                );
            } finally {
                if (videoTempFile != null && videoTempFile.exists()) {
                    videoTempFile.delete();
                }
            }
        }

        yeuCau.setNgayYeuCau(LocalDateTime.now());
        yeuCau.setTaiKhoan(taiKhoanOpt.get());
        yeuCau.setTrangThai(0); // Chờ xác nhận
        YeuCauTraHang savedYeuCau = yeuCauTraHangRepo.save(yeuCau);

        LichSuTraHang lichSu = new LichSuTraHang();
        lichSu.setYeuCauTraHang(savedYeuCau);
        lichSu.setThaoTac(0); // Chờ xác nhận
        lichSu.setThoiGianThaoTac(LocalDateTime.now());
        lichSu.setTaiKhoan(taiKhoanOpt.get());
        lichSu.setTrangThaiCu(null); // Trạng thái cũ: null
        lichSu.setTrangThaiMoi(0); // Trạng thái mới: Chờ xác nhận
        lichSuTraHangRepo.save(lichSu);

        return savedYeuCau;
    }

    public YeuCauTraHang approveYeuCauTraHang(Integer id, Integer idTaiKhoanDuyet) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepo.findById(idTaiKhoanDuyet);
        if (taiKhoanOpt.isEmpty() || (!taiKhoanOpt.get().getVaiTro().equals("STAFF") && !taiKhoanOpt.get().getVaiTro().equals("ADMIN"))) {
            throw new CustomException(
                    "Chỉ nhân viên hoặc quản trị viên được phép duyệt yêu cầu.",
                    HttpStatus.FORBIDDEN,
                    "UNAUTHORIZED_ACCESS"
            );
        }

        Optional<YeuCauTraHang> yeuCauOpt = yeuCauTraHangRepo.findById(id);
        if (yeuCauOpt.isEmpty()) {
            throw new CustomException(
                    "Yêu cầu trả hàng không tồn tại.",
                    HttpStatus.NOT_FOUND,
                    "YEU_CAU_NOT_FOUND"
            );
        }

        YeuCauTraHang yeuCau = yeuCauOpt.get();
        if (yeuCau.getTrangThai() != 0) {
            throw new CustomException(
                    "Yêu cầu này đã được xử lý (duyệt hoặc từ chối).",
                    HttpStatus.BAD_REQUEST,
                    "YEU_CAU_ALREADY_PROCESSED"
            );
        }

        Integer trangThaiCu = yeuCau.getTrangThai();
        TaiKhoan taiKhoan = taiKhoanOpt.get();
        yeuCau.setTaiKhoanDuyet(taiKhoan);
        yeuCau.setNgayDuyet(LocalDateTime.now());
        yeuCau.setTrangThai(1); // Đã duyệt

        if (!yeuCau.getTinhTrangHang().equals("NguyenVen") && !yeuCau.getTinhTrangHang().equals("HuHong")) {
            throw new CustomException(
                    "Tình trạng hàng không hợp lệ: " + yeuCau.getTinhTrangHang(),
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TINH_TRANG_HANG"
            );
        }

        yeuCauTraHangRepo.save(yeuCau);

        LichSuTraHang lichSu = new LichSuTraHang();
        lichSu.setYeuCauTraHang(yeuCau);
        lichSu.setThaoTac(1); // Xác nhận
        lichSu.setThoiGianThaoTac(LocalDateTime.now());
        lichSu.setTaiKhoan(taiKhoanOpt.get());
        lichSu.setTrangThaiCu(trangThaiCu);
        lichSu.setTrangThaiMoi(1);
        lichSuTraHangRepo.save(lichSu);

        if (yeuCau.getTinhTrangHang().equals("HuHong")) {
            TraHangNhaSanXuat traHangNSX = new TraHangNhaSanXuat();
            traHangNSX.setYeuCauTraHang(yeuCau);

            if (yeuCau.getSpct() == null) {
                throw new CustomException(
                        "Sản phẩm chi tiết không hợp lệ.",
                        HttpStatus.BAD_REQUEST,
                        "INVALID_SPCT"
                );
            }
            Optional<Spct> spctOpt = spctRepo.findById(yeuCau.getSpct().getIdSpct());
            if (spctOpt.isEmpty()) {
                throw new CustomException(
                        "Không tìm thấy sản phẩm chi tiết.",
                        HttpStatus.NOT_FOUND,
                        "SPCT_NOT_FOUND"
                );
            }
            Optional<SanPham> sanPhamOpt = sanPhamRepo.findById(spctOpt.get().getSanPham().getIdSanPham());
            if (sanPhamOpt.isEmpty()) {
                throw new CustomException(
                        "Không tìm thấy sản phẩm.",
                        HttpStatus.NOT_FOUND,
                        "SAN_PHAM_NOT_FOUND"
                );
            }
            traHangNSX.setThuongHieu(sanPhamOpt.get().getThuongHieu());

            traHangNSX.setNgayGuiTra(LocalDateTime.now());
            traHangNSX.setTrangThaiGui(1); // Đã gửi
            traHangNhaSanXuatRepo.save(traHangNSX);
        }

        return yeuCau;
    }

    public YeuCauTraHang rejectYeuCauTraHang(Integer id, Integer idTaiKhoanDuyet, String lyDoTuChoi) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepo.findById(idTaiKhoanDuyet);
        if (taiKhoanOpt.isEmpty() || (!taiKhoanOpt.get().getVaiTro().equals("STAFF") && !taiKhoanOpt.get().getVaiTro().equals("ADMIN"))) {
            throw new CustomException(
                    "Chỉ nhân viên hoặc quản trị viên được phép từ chối yêu cầu.",
                    HttpStatus.FORBIDDEN,
                    "UNAUTHORIZED_ACCESS"
            );
        }

        Optional<YeuCauTraHang> yeuCauOpt = yeuCauTraHangRepo.findById(id);
        if (yeuCauOpt.isEmpty()) {
            throw new CustomException(
                    "Yêu cầu trả hàng không tồn tại.",
                    HttpStatus.NOT_FOUND,
                    "YEU_CAU_NOT_FOUND"
            );
        }

        YeuCauTraHang yeuCau = yeuCauOpt.get();
        if (yeuCau.getTrangThai() != 0) {
            throw new CustomException(
                    "Yêu cầu này đã được xử lý (duyệt hoặc từ chối).",
                    HttpStatus.BAD_REQUEST,
                    "YEU_CAU_ALREADY_PROCESSED"
            );
        }

        if (lyDoTuChoi == null || lyDoTuChoi.trim().isEmpty()) {
            throw new CustomException(
                    "Vui lòng cung cấp lý do từ chối yêu cầu.",
                    HttpStatus.BAD_REQUEST,
                    "MISSING_LY_DO_TU_CHOI"
            );
        }

        Integer trangThaiCu = yeuCau.getTrangThai();
        yeuCau.setTaiKhoanDuyet(taiKhoanOpt.get());
        yeuCau.setNgayDuyet(LocalDateTime.now());
        yeuCau.setTrangThai(2); // Từ chối
        yeuCauTraHangRepo.save(yeuCau);

        LichSuTraHang lichSu = new LichSuTraHang();
        lichSu.setYeuCauTraHang(yeuCau);
        lichSu.setThaoTac(2); // Từ chối
        lichSu.setThoiGianThaoTac(LocalDateTime.now());
        lichSu.setTaiKhoan(taiKhoanOpt.get());
        lichSu.setLyDoTuChoi(lyDoTuChoi);
        lichSu.setTrangThaiCu(trangThaiCu);
        lichSu.setTrangThaiMoi(2);
        lichSuTraHangRepo.save(lichSu);

        return yeuCau;
    }

    public YeuCauTraHang completeYeuCauTraHang(Integer id, Integer idTaiKhoanDuyet) {
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepo.findById(idTaiKhoanDuyet);
        if (taiKhoanOpt.isEmpty() || (!taiKhoanOpt.get().getVaiTro().equals("STAFF") && !taiKhoanOpt.get().getVaiTro().equals("ADMIN"))) {
            throw new CustomException(
                    "Chỉ nhân viên hoặc quản trị viên được phép hoàn thành yêu cầu.",
                    HttpStatus.FORBIDDEN,
                    "UNAUTHORIZED_ACCESS"
            );
        }

        Optional<YeuCauTraHang> yeuCauOpt = yeuCauTraHangRepo.findById(id);
        if (yeuCauOpt.isEmpty()) {
            throw new CustomException(
                    "Yêu cầu trả hàng không tồn tại.",
                    HttpStatus.NOT_FOUND,
                    "YEU_CAU_NOT_FOUND"
            );
        }

        YeuCauTraHang yeuCau = yeuCauOpt.get();
        if (yeuCau.getTrangThai() != 1) {
            throw new CustomException(
                    "Yêu cầu này chưa được duyệt hoặc đã hoàn thành.",
                    HttpStatus.BAD_REQUEST,
                    "YEU_CAU_NOT_APPROVED"
            );
        }

        Integer trangThaiCu = yeuCau.getTrangThai();

        if (yeuCau.getTinhTrangHang().equals("NguyenVen")) {
            Integer soLuongTra = yeuCau.getSoLuong();
            if (soLuongTra == null || soLuongTra <= 0) {
                throw new CustomException(
                        "Số lượng sản phẩm trả không hợp lệ.",
                        HttpStatus.BAD_REQUEST,
                        "INVALID_SO_LUONG"
                );
            }

            if (yeuCau.getSpct() == null) {
                throw new CustomException(
                        "Sản phẩm chi tiết không hợp lệ.",
                        HttpStatus.BAD_REQUEST,
                        "INVALID_SPCT"
                );
            }
            Optional<Spct> spctOpt = spctRepo.findById(yeuCau.getSpct().getIdSpct());
            if (spctOpt.isEmpty()) {
                throw new CustomException(
                        "Không tìm thấy sản phẩm chi tiết.",
                        HttpStatus.NOT_FOUND,
                        "SPCT_NOT_FOUND"
                );
            }
            Spct spct = spctOpt.get();
            Integer currentSoLuongSpct = spct.getSoLuongTonKho() != null ? spct.getSoLuongTonKho() : 0;
            spct.setSoLuongTonKho(currentSoLuongSpct + soLuongTra);
            spctRepo.save(spct);
        }

        yeuCau.setTrangThai(3); // Hoàn thành
        yeuCauTraHangRepo.save(yeuCau);

        LichSuTraHang lichSu = new LichSuTraHang();
        lichSu.setYeuCauTraHang(yeuCau);
        lichSu.setThaoTac(3); // Hoàn thành
        lichSu.setThoiGianThaoTac(LocalDateTime.now());
        lichSu.setTaiKhoan(taiKhoanOpt.get());
        lichSu.setTrangThaiCu(trangThaiCu);
        lichSu.setTrangThaiMoi(3);
        lichSuTraHangRepo.save(lichSu);

        return yeuCau;
    }

    public List<YeuCauTraHang> getYeuCauByTinhTrangHang(String tinhTrangHang) {
        if (!tinhTrangHang.equals("NguyenVen") && !tinhTrangHang.equals("HuHong")) {
            throw new CustomException(
                    "Tình trạng hàng không hợp lệ. Vui lòng chọn 'Nguyên vẹn' hoặc 'Hỏng'.",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TINH_TRANG_HANG"
            );
        }
        return yeuCauTraHangRepo.findByTinhTrangHang(tinhTrangHang);
    }
}