package com.example.scent.service;


import com.example.scent.dto.*;
import com.example.scent.entity.*;
import com.example.scent.repo.*;
import com.example.scent.reques.OrderOfflineRequest;
import com.example.scent.reques.PhiVanChuyenRequest;
import com.example.scent.reques.UpdateOrderStatusRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;


@Service
public class DonHangSv {
    private static final Logger log = LoggerFactory.getLogger(DonHangSv.class);

    @PersistenceContext
    private EntityManager entityManager;

@Autowired
    PhieuGiamGiaInterface phieuGiamGiaInterface;
    @Autowired
    private DiaChiApi diaChiApi;
    @Autowired
    HinhAnhInterface hinhAnhInterface;
    @Autowired
    DonHangInterface dhi;
    @Autowired
    SpctInterface spc;
    @Autowired
    CTDHInterface cdh;
@Autowired
    TaiKhoanInterface tki;
@Autowired
LichSuThaoTacInterface lichSuThaoTacInterface;
    public List<SanPhamThongKeDto> getProductStatistics(Integer year, Integer month) {

        int status = 1; // 1 : Đã nhận

        return dhi.getProductStatistics(year, month, status);
    }

    public double getTotalRevenue(Integer year, Integer month) {
        Double totalRevenue = dhi.getTotalRevenue(year, month);
        return totalRevenue != null ? totalRevenue : 0.0;  // Trả về 0 nếu không có kết quả
    }

    public List<DonHang> getAll() {
        return dhi.findAll();
    }


    public DonHang add(DonHang dh) {
        return dhi.save(dh);
    }


    public DonHang update(DonHang dh) {
        return dhi.save(dh);
    }


    public void delete(Integer id) {
        dhi.deleteById(id);
    }


    public DonHang detail(Integer id) {
        return dhi.findById(id).get();
    }

    @Transactional
    public void updateTrangThaiDonHang(Integer id) {
        dhi.updateStatusToProcessing(id);
    }

    public List<DonHang> getDonHangByTrangThai(Integer trangThai) {
        return dhi.findByTrangThai(trangThai);
    }

    @Transactional

    public DonHang createOrder(DonHangDTO orderRequest) throws Exception {
        // Kiểm tra ID tài khoản
        if (orderRequest.getIdTaiKhoan() == null) {
            throw new RuntimeException("⚠️ Lỗi: ID tài khoản không được để trống!");
        }

        // Tìm tài khoản
        TaiKhoan taiKhoan = tki.findById(orderRequest.getIdTaiKhoan())
                .orElseThrow(() -> new RuntimeException("⚠️ Lỗi: Tài khoản không tồn tại với ID: " + orderRequest.getIdTaiKhoan()));

        // Kiểm tra địa chỉ giao hàng (tỉnh, quận, phường)
        Map<Integer, String> tinhList = DiaChiApi.callGetTinhThanhAPI();
        if (!tinhList.containsKey(orderRequest.getMaTinh())) {
            throw new RuntimeException("⚠️ Lỗi: Tỉnh không tồn tại với ID: " + orderRequest.getMaTinh());
        }

        Map<String, String> quanList = DiaChiApi.callGetQuanHuyenAPI(orderRequest.getMaTinh());
        if (!quanList.containsKey(String.valueOf(orderRequest.getMaQuan()))) {
            throw new RuntimeException("⚠️ Lỗi: Quận không tồn tại với ID: " + orderRequest.getMaQuan());
        }

        Map<String, String> phuongList = DiaChiApi.callGetPhuongXaAPI(orderRequest.getMaQuan());
        System.out.println("phuongList: " + phuongList);
        if (!phuongList.containsKey(orderRequest.getMaPhuong())) {
            throw new RuntimeException("⚠️ Lỗi: Phường không tồn tại với ID: " + orderRequest.getMaPhuong());
        }

        // Tính phí vận chuyển
        PhiVanChuyenRequest phiVanChuyenRequest = convertToPhiVanChuyenRequest(orderRequest);
        BigDecimal phiVanChuyen = DiaChiApi.getFee(phiVanChuyenRequest);
        if (phiVanChuyen.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("⚠️ Lỗi: Phí vận chuyển không hợp lệ!");
        }

        // Xác định ngày tạo đơn hàng
        LocalDateTime ngayTao = (orderRequest.getNgayTao() != null) ? orderRequest.getNgayTao() : LocalDateTime.now();

        // Tính tổng tiền gốc (thanhTienGoc) từ danh sách sản phẩm
        BigDecimal thanhTienGoc = BigDecimal.ZERO;
        List<ChiTietDonHang> chiTietList = new ArrayList<>();

        for (OrderItemDto itemDTO : orderRequest.getChiTietDonHangs()) {
            Spct spct = spc.findById(itemDTO.getSpctId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + itemDTO.getSpctId()));

            // Kiểm tra số lượng tồn kho
            if (itemDTO.getQuantity() > spct.getSoLuongTonKho()) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Sản phẩm ID: " + itemDTO.getSpctId() + " chỉ còn " + spct.getSoLuongTonKho() + " sản phẩm.");
            }

            // Tính thành tiền cho từng sản phẩm
            BigDecimal thanhTien = spct.getDonGia().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            thanhTienGoc = thanhTienGoc.add(thanhTien);

            // Tạo chi tiết đơn hàng
            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setSpct(spct);
            chiTiet.setSoLuong(itemDTO.getQuantity());
            chiTiet.setDonGia(spct.getDonGia());
            chiTiet.setThanhTien(thanhTien);

            // Lấy danh sách hình ảnh từ HinhAnhRepository
            List<String> productImages = hinhAnhInterface.findHinhAnhBySanPhamId(spct.getSanPham().getIdSanPham())
                    .stream()
                    .map(HinhAnh::getLink)
                    .collect(Collectors.toList());

            itemDTO.setImageURL(productImages); // Gán danh sách ảnh vào OrderItemDto
            System.out.println("Hình ảnh sản phẩm ID " + spct.getSanPham().getIdSanPham() + ": " + productImages);
            spct.setImageUrl(productImages);
            spct.setSoLuongTonKho(spct.getSoLuongTonKho());
            chiTietList.add(chiTiet);
        }

        // Kiểm tra và áp dụng mã giảm giá
        BigDecimal thanhTienSauGiam = thanhTienGoc;
        PhieuGiamGia phieuGiamGia = null;
        BigDecimal soTienGiam = BigDecimal.ZERO;

        if (orderRequest.getMaGiamGia() != null && !orderRequest.getMaGiamGia().isEmpty()) {
            // Tìm mã giảm giá
            phieuGiamGia = phieuGiamGiaInterface.findByMaGiamGia(orderRequest.getMaGiamGia())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá không tồn tại hoặc không hợp lệ!"));
            if (phieuGiamGia.getDieuKienapDung() != 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá này chỉ áp dụng cho đơn hàng offline!");
            }
            // Kiểm tra thời gian hiệu lực
            LocalDateTime now = LocalDateTime.now();
            if (phieuGiamGia.getNgayBatDau().isAfter(now) || phieuGiamGia.getNgayHetHan().isBefore(now)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!");
            }

            // Kiểm tra số lượng phiếu giảm giá còn lại
            if (phieuGiamGia.getSoLuong() == null || phieuGiamGia.getSoLuong() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá đã hết lượt sử dụng!");
            }

            // Kiểm tra xem tài khoản đã sử dụng mã giảm giá này chưa
            boolean hasUsedThisDiscount = dhi.existsByTaiKhoanAndPhieuGiamGia(taiKhoan, phieuGiamGia);
            if (hasUsedThisDiscount) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Tài khoản này đã sử dụng mã giảm giá này rồi.");
            }

            // Tính số tiền giảm
            BigDecimal phanTramGiam = phieuGiamGia.getGiaTriGiam();
            soTienGiam = thanhTienGoc.multiply(phanTramGiam);

            // Kiểm tra giá trị tối đa của mã giảm giá (nếu có)
            if (phieuGiamGia.getGia_tri_toi_da() != null && soTienGiam.compareTo(phieuGiamGia.getGia_tri_toi_da()) > 0) {
                soTienGiam = phieuGiamGia.getGia_tri_toi_da();
            }

            thanhTienSauGiam = thanhTienGoc.subtract(soTienGiam);
            if (thanhTienSauGiam.compareTo(BigDecimal.ZERO) < 0) {
                thanhTienSauGiam = BigDecimal.ZERO;
            }

            // Giảm số lượng phiếu giảm giá còn lại
            phieuGiamGia.setSoLuong(phieuGiamGia.getSoLuong() - 1);
            phieuGiamGiaInterface.save(phieuGiamGia);
        }

        // Tính tổng tiền sau khi cộng phí vận chuyển
        BigDecimal tongTien = thanhTienSauGiam.add(phiVanChuyen);

        // Tạo đơn hàng mới
        DonHang newOrder = new DonHang();
        newOrder.setTaiKhoan(taiKhoan);
        newOrder.setTenNguoiNhanHang(orderRequest.getTenNguoiNhanHang());
        newOrder.setDiaChiGiaoHang(orderRequest.getDiaChiGiaoHang());
        newOrder.setSdtNguoiNhan(orderRequest.getSdtNguoiNhan());
        newOrder.setPhuongThucVanChuyen(orderRequest.getPhuongThucVanChuyen());
        newOrder.setPhuongThucThanhToan(orderRequest.getPhuongThucThanhToan());
        newOrder.setNgayTao(ngayTao);
        newOrder.setNgayVanChuyen(orderRequest.getNgayVanChuyen());
        newOrder.setTrangThai(1);
        newOrder.setGhiChu(orderRequest.getGhichu());
        newOrder.setPhiVanChuyen(phiVanChuyen);
        newOrder.setMaTinh(orderRequest.getMaTinh());
        newOrder.setMaQuan(orderRequest.getMaQuan());
        newOrder.setMaPhuong(orderRequest.getMaPhuong());
        newOrder.setSoTienGiam(soTienGiam);
        newOrder.setTongTien(tongTien);
        newOrder.setLuongBan(orderRequest.getLuongBan());

        // Gán mã giảm giá nếu có
        if (phieuGiamGia != null) {
            newOrder.setPhieuGiamGia(phieuGiamGia);
        }

        // Lưu đơn hàng
        DonHang savedOrder = dhi.save(newOrder);

        // Gán đơn hàng cho các chi tiết đơn hàng và lưu
        for (ChiTietDonHang chiTiet : chiTietList) {
            chiTiet.setDonHang(savedOrder);
        }
        cdh.saveAll(chiTietList);
        savedOrder.setChiTietDonHangs(chiTietList);

        // Cập nhật địa chỉ của tài khoản với địa chỉ giao hàng của đơn hàng mới nhất
        taiKhoan.setDiaChi(savedOrder.getDiaChiGiaoHang());
        tki.save(taiKhoan); // Lưu lại tài khoản với địa chỉ đã cập nhật

        return savedOrder;
    }
    // Phương thức chuyển đổi DonHangDTO thành PhiVanChuyenRequest
    private PhiVanChuyenRequest convertToPhiVanChuyenRequest(DonHangDTO orderRequest) {
        PhiVanChuyenRequest request = new PhiVanChuyenRequest();
        request.setIdQuanHuyen(orderRequest.getMaQuan());
        request.setIdPhuongXa(orderRequest.getMaPhuong());
        request.setTrungBinhCacCanh(orderRequest.getTrungBinhCacCanh());
        request.setSoLuongSanPham(orderRequest.getChiTietDonHangs().size());
        return request;
    }
    private PhiVanChuyenRequest convertToPhiVanChuyenRequest1(DonHang donHang) {
        PhiVanChuyenRequest request = new PhiVanChuyenRequest();
        // Điền các thông tin cần thiết cho PhiVanChuyenRequest từ DonHang
        request.setIdQuanHuyen(donHang.getMaQuan());
        request.setIdPhuongXa(donHang.getMaPhuong());
        // Các thông tin khác như trọng lượng, kích thước,... có thể lấy từ đơn hàng hoặc cấu hình mặc định
        request.setWeight(1000); // Ví dụ: trọng lượng 1000g
        request.setLength(20);   // Ví dụ: chiều dài 20cm
        request.setWidth(20);    // Ví dụ: chiều rộng 20cm
        request.setHeight(20);   // Ví dụ: chiều cao 20cm
        request.setTrungBinhCacCanh(donHang.getTrungBinhCacCanh());
        request.setSoLuongSanPham(donHang.getChiTietDonHangs().size());
        // Thêm các thông tin khác nếu API GHN yêu cầu (ví dụ: service_id, from_district_id,...)
        return request;
    }

    private Map<Integer, List<String>> getHinhAnhBySanPhamIds(List<Integer> sanPhamIds) {
        // Giả sử bạn có một repository là sanPhamRepository và hinhAnhRepository
        Map<Integer, List<String>> imageMap = new HashMap<>();

        for (Integer id : sanPhamIds) {
            List<HinhAnh> hinhAnhs = hinhAnhInterface.findHinhAnhBySanPhamId(id);
            List<String> imageUrls = hinhAnhs.stream()
                    .map(HinhAnh::getLink)  // Giả sử HinhAnh có phương thức getUrl
                    .collect(Collectors.toList());
            imageMap.put(id.intValue(), imageUrls);
        }

        return imageMap;
    }

    public List<DonHang> getDonHangByStatus(int trangThai) {
        List<DonHang> donHangPage;

        // Nếu có trạng thái lọc
        if (trangThai != -1) {
            donHangPage = dhi.findByTrangThai(trangThai);
        } else {
            // Nếu không lọc trạng thái, lấy tất cả đơn hàng
            donHangPage = dhi.findAll();
        }

        // Lấy các ID sản phẩm từ các đơn hàng
        List<Integer> sanPhamIds = donHangPage.stream()
                .flatMap(dh -> dh.getChiTietDonHangs().stream())
                .map(ctdh -> ctdh.getSpct().getSanPham().getIdSanPham())
                .distinct()
                .collect(Collectors.toList());

        // Lấy hình ảnh tương ứng cho mỗi sản phẩm
        Map<Integer, List<String>> imageMap = getHinhAnhBySanPhamIds(sanPhamIds);

        // Gán hình ảnh và tính toán số tiền giảm cho mỗi đơn hàng
        donHangPage.forEach(dh -> {
            dh.getChiTietDonHangs().forEach(ctdh -> {
                Spct spct = ctdh.getSpct();
                SanPham sp = spct.getSanPham();
                if (imageMap.containsKey(sp.getIdSanPham())) {
                    spct.setImageUrl(imageMap.get(sp.getIdSanPham())); // Gán danh sách URL hình ảnh
                }
            });

            BigDecimal soTienGiam = BigDecimal.ZERO;
            BigDecimal thanhTienGoc = BigDecimal.ZERO;

            // Tính tổng tiền gốc (đơn giá * số lượng) của tất cả sản phẩm
            List<ChiTietDonHang> chiTietList = dh.getChiTietDonHangs();
            for (ChiTietDonHang ctdh : chiTietList) {
                BigDecimal donGia = ctdh.getDonGia();
                System.out.println("đoN GIÁ "+donGia);
                BigDecimal soLuong = BigDecimal.valueOf(ctdh.getSoLuong());
                thanhTienGoc = thanhTienGoc.add(donGia.multiply(soLuong));
            }
            System.out.println("Tổng tiền gốc: " + thanhTienGoc); // Debug

            // Tính số tiền giảm nếu có phiếu giảm giá
            if (dh.getPhieuGiamGia() != null && dh.getPhieuGiamGia().getGiaTriGiam() != null) {
                BigDecimal giaTriGiam = dh.getPhieuGiamGia().getGiaTriGiam(); // Giá trị giảm (0.1 đến 0.9)

                // Kiểm tra giá trị giảm có trong khoảng hợp lệ không
                if (giaTriGiam.compareTo(BigDecimal.ZERO) > 0 && giaTriGiam.compareTo(BigDecimal.ONE) <= 0) {
                    soTienGiam = thanhTienGoc.multiply(giaTriGiam).setScale(2, RoundingMode.HALF_UP);
                    System.out.println("Số tiền giảm ban đầu (phần trăm): " + soTienGiam);

                    // Áp dụng giới hạn tối đa nếu có
                    BigDecimal giaTriToiDa = dh.getPhieuGiamGia().getGia_tri_toi_da();
                    if (giaTriToiDa != null && soTienGiam.compareTo(giaTriToiDa) > 0) {
                        soTienGiam = giaTriToiDa;
                        System.out.println("Số tiền giảm sau khi áp dụng giới hạn tối đa: " + soTienGiam);
                    }
                }
            }

            dh.setSoTienGiam(soTienGiam);
            System.out.println("Số tiền giảm cuối cùng: " + soTienGiam); // Debug
        });

        return donHangPage;
    }
    public List<donhangDetailDTO> getDonHangDetailsById(Integer id) {
        return dhi.findDonHangDetailsById(id);
    }
    @Transactional
    public DonHang capNhatTrangThaiDonHang(Integer id, Integer trangThai, String lyDoHuy) throws Exception {
        // Tìm đơn hàng từ database
        DonHang donHang = dhi.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn hàng với ID: " + id));

        // Nếu trạng thái là "Đã Thanh Toán" (trạng thái 4), kiểm tra và cập nhật tồn kho
        if (trangThai == 3) {
            System.out.println("⚠️ Đang cập nhật tồn kho...");

            for (ChiTietDonHang chiTiet : donHang.getChiTietDonHangs()) {
                Spct spct = chiTiet.getSpct();
                if (spct != null) {
                    int soLuongTonKhoCu = spct.getSoLuongTonKho();
                    int soLuongTru = chiTiet.getSoLuong();
                    int soLuongMoi = soLuongTonKhoCu - soLuongTru;

                    System.out.println("🛒 Sản phẩm: " + spct.getIdSpct() + " | Tồn kho trước: " + soLuongTonKhoCu + " | Trừ: " + soLuongTru + " | Tồn kho sau: " + soLuongMoi);

                    if (soLuongMoi < 0) {
                        System.out.println("❌ Không đủ tồn kho, rollback transaction!");
                        throw new Exception("Không đủ tồn kho cho sản phẩm ID: " + spct.getIdSpct());
                    }

                    spct.setSoLuongTonKho(soLuongMoi);
                    spc.save(spct);
                }
            }
        }

        // Nếu trạng thái là "Đã Hủy" (trạng thái 5), yêu cầu lý do hủy
        if (trangThai == 5) {
            if (lyDoHuy == null || lyDoHuy.trim().isEmpty()) {
                throw new Exception("Lý do hủy không thể trống!");
            }
            donHang.setLyDoHuy(lyDoHuy);  // Lưu lý do hủy vào đối tượng đơn hàng
        }

        // Cập nhật trạng thái của đơn hàng
        donHang.setTrangThai(trangThai);
        DonHang updatedOrder = dhi.save(donHang);

        System.out.println("✅ Đơn hàng ID " + id + " cập nhật thành công. Trạng thái mới: " + trangThai);

        // ✅ Thêm log xác nhận transaction
        System.out.println("🔄 Commit transaction thành công!");

        return updatedOrder;
    }
//    public Page<DonHang> getDonHangByTrangThai(Integer trangThai, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by("ngayTao").descending());
//        return (trangThai == null) ? dhi.findAll(pageable) : dhi.findByTrangThai(trangThai, pageable);
//    }
public List<donhangDTOID> getDonHangsByTaiKhoan(Integer idTaiKhoan) {
    // Truy vấn danh sách đơn hàng của người dùng
    List<DonHang> donHangs = dhi.findByTaiKhoanId(idTaiKhoan);

    // Chuyển đổi sang donhangDTOID
    return donHangs.stream().map(donHang -> {
        donhangDTOID donHangDTO = new donhangDTOID();
        donHangDTO.setIdTaiKhoan(donHang.getTaiKhoan().getId());
        donHangDTO.setTenNguoiNhanHang(donHang.getTenNguoiNhanHang());
        donHangDTO.setMaDonHang(donHang.getId());
        donHangDTO.setDiaChiGiaoHang(donHang.getDiaChiGiaoHang());
        donHangDTO.setSdtNguoiNhan(donHang.getSdtNguoiNhan());
        donHangDTO.setPhuongThucVanChuyen(donHang.getPhuongThucVanChuyen());
        donHangDTO.setPhuongThucThanhToan(donHang.getPhuongThucThanhToan());
        donHangDTO.setNgayTao(donHang.getNgayTao());
        donHangDTO.setNgayVanChuyen(donHang.getNgayVanChuyen());
        donHangDTO.setGhichu(donHang.getGhiChu());
        donHangDTO.setTongTien(donHang.getTongTien());
        donHangDTO.setTrangThai(donHang.getTrangThai());
        donHangDTO.setPhiVanChuyen(donHang.getPhiVanChuyen());
        donHangDTO.setMaTinh(donHang.getMaTinh());
        donHangDTO.setMaQuan(donHang.getMaQuan());
        donHangDTO.setMaPhuong(donHang.getMaPhuong());
        donHangDTO.setPhieuGiamGia(donHang.getPhieuGiamGia() != null ? donHang.getPhieuGiamGia().getMaGiamGia() : null);

        // Lấy danh sách chi tiết đơn hàng từ DonHang
        List<ChiTietDonHang> chiTietList = donHang.getChiTietDonHangs();
        List<OrderItemDTOID> chiTietDTOList = new ArrayList<>();

        // Chuyển đổi chi tiết đơn hàng
        for (ChiTietDonHang chiTiet : chiTietList) {
            Spct spct = chiTiet.getSpct();
            OrderItemDTOID itemDTO = new OrderItemDTOID();
            itemDTO.setSpctId(spct.getIdSpct());
            itemDTO.setQuantity(chiTiet.getSoLuong());
            // Lấy donGia từ chiTiet (giá cũ) thay vì spct (giá mới)
            BigDecimal donGia = chiTiet.getDonGia();
            if (donGia == null) {
                System.out.println("Đơn giá null cho chi tiết đơn hàng ID: %d, spctId: %d"+ chiTiet.getId()+spct.getIdSpct());
                donGia = BigDecimal.ZERO; // Gán giá mặc định là 0 nếu null
            }
            itemDTO.setDonGia(donGia);
            // Tính thanhTien dựa trên donGia từ chiTiet
            itemDTO.setThanhTien(donGia.multiply(BigDecimal.valueOf(chiTiet.getSoLuong())));
            itemDTO.setTenSanPham(spct.getSanPham().getTenSanPham());
            itemDTO.setIdSanPham(spct.getSanPham().getIdSanPham());

            // Lấy danh sách hình ảnh từ HinhAnhRepository
            List<String> productImages = hinhAnhInterface.findHinhAnhBySanPhamId(spct.getSanPham().getIdSanPham())
                    .stream()
                    .map(HinhAnh::getLink)
                    .collect(Collectors.toList());
            itemDTO.setImageURL(productImages);

            chiTietDTOList.add(itemDTO);
        }

        // Gán danh sách chi tiết đơn hàng vào DTO
        donHangDTO.setChiTietDonHangs(chiTietDTOList);

        // Tính tổng tiền trước giảm (dựa trên chi tiết đơn hàng)
        BigDecimal tongTienTruocGiam = chiTietDTOList.stream()
                .map(item -> item.getDonGia().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính số tiền giảm dựa trên tổng tiền toàn đơn
        BigDecimal soTienGiam = BigDecimal.ZERO;
        PhieuGiamGia phieuGiamGia = donHang.getPhieuGiamGia();
        if (phieuGiamGia != null && phieuGiamGia.getGiaTriGiam() != null) {
            BigDecimal giaTriGiam = phieuGiamGia.getGiaTriGiam(); // Giá trị giảm (0.1 đến 0.9)

            // Kiểm tra giá trị giảm có trong khoảng 0.1 đến 0.9 không
            if (giaTriGiam.compareTo(BigDecimal.valueOf(0.1)) >= 0 && giaTriGiam.compareTo(BigDecimal.valueOf(0.9)) <= 0) {
                // Tính số tiền giảm: tổng tiền trước giảm * giá trị giảm
                soTienGiam = tongTienTruocGiam.multiply(giaTriGiam).setScale(2, RoundingMode.HALF_UP);


                // Áp dụng giới hạn tối đa nếu có
                BigDecimal giaTriToiDa = phieuGiamGia.getGia_tri_toi_da();
                if (giaTriToiDa != null && soTienGiam.compareTo(giaTriToiDa) > 0) {
                    soTienGiam = giaTriToiDa;

                }
            } else {

            }
        }

        donHangDTO.setSoTienGiam(soTienGiam);

        // Phân bổ số tiền giảm cho từng sản phẩm (tỷ lệ)
        if (!chiTietDTOList.isEmpty() && soTienGiam.compareTo(BigDecimal.ZERO) > 0) {
            for (OrderItemDTOID item : chiTietDTOList) {
                BigDecimal itemTotal = item.getDonGia().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal itemDiscount = soTienGiam.multiply(itemTotal)
                        .divide(tongTienTruocGiam, 2, RoundingMode.HALF_UP);
                item.setSoTienGiamGia(itemDiscount);
            }
        }

        // Tính lại tongTien dựa trên chiTietDTOList để đảm bảo đồng bộ
        BigDecimal tongTien = tongTienTruocGiam.subtract(soTienGiam).add(donHang.getPhiVanChuyen());
        donHangDTO.setTongTien(tongTien);

        return donHangDTO;
    }).collect(Collectors.toList());
}
//    @Transactional
//    public void savePhuongToDB(String maPhuong, String tenPhuong) {
//        // Kiểm tra xem phường đã có trong cơ sở dữ liệu chưa
//        Phuong existingPhuong = phuongInterface.findByMaPhuong(maPhuong).orElse(null);
//
//        if (existingPhuong == null) {
//            // Phường chưa có, lưu mới
//            Phuong newPhuong = new Phuong();
//            newPhuong.setMaPhuong(maPhuong);
//            newPhuong.setTenPhuong(tenPhuong);  // Lấy tên phường từ API GHN
//            phuongInterface.save(newPhuong);  // Lưu vào cơ sở dữ liệu
//        } else {
//            // Nếu phường đã tồn tại, chỉ cần làm mới thông tin nếu cần
//            entityManager.refresh(existingPhuong);  // Làm mới đối tượng phường từ cơ sở dữ liệu
//        }
//    }
//    @Transactional
//    public void saveQuanToDB(Integer maQuan, String tenQuan) {
//        // Kiểm tra xem quận đã có trong cơ sở dữ liệu chưa
//        quan existingQuan = quanInterface.findByMaQuan(maQuan).orElse(null);
//
//        if (existingQuan == null) {
//            // Quận chưa có, lưu mới
//            quan newQuan = new quan();
//            newQuan.setMaQuan(maQuan);
//            newQuan.setTenQuan(tenQuan);  // Lấy tên quận từ API GHN
//            quanInterface.save(newQuan);  // Lưu vào cơ sở dữ liệu
//        } else {
//            // Nếu quận đã tồn tại, chỉ cần làm mới thông tin nếu cần
//            entityManager.refresh(existingQuan);  // Làm mới đối tượng quận từ cơ sở dữ liệu
//        }
//    }
//    @Transactional
//    public void saveTinhToDB(Integer maTinh, String tenTinh) {
//        // Kiểm tra xem tỉnh đã có trong cơ sở dữ liệu chưa
//        tinh existingTinh = tinhInterface.findByMaTinh(maTinh).orElse(null);
//
//        if (existingTinh == null) {
//            // Tỉnh chưa có, lưu mới
//            tinh newTinh = new tinh();
//            newTinh.setMaTinh(maTinh);
//            newTinh.setTenTinh(tenTinh);  // Lấy tên tỉnh từ API GHN
//            tinhInterface.save(newTinh);  // Lưu vào cơ sở dữ liệu
//        } else {
//            // Nếu tỉnh đã tồn tại, chỉ cần làm mới thông tin nếu cần
//            entityManager.refresh(existingTinh);  // Làm mới đối tượng tỉnh từ cơ sở dữ liệu
//        }
//    }

    public BigDecimal calculateShippingFee(int maTinh, int maQuan, String maPhuong, int soLuongSanPham) throws Exception {
        // Tạo đối tượng request cho API GHN
        PhiVanChuyenRequest phiRequest = new PhiVanChuyenRequest();
        phiRequest.setIdQuanHuyen(maQuan); // Mã quận
        phiRequest.setStringPhuongXa(maPhuong); // Mã phường
        phiRequest.setSoLuongSanPham(soLuongSanPham); // Số lượng sản phẩm
        phiRequest.setTrungBinhCacCanh(10);  // Tính toán chiều dài trung bình (nếu cần)

        // Gọi API GHN để lấy phí vận chuyển
        BigDecimal phiVanChuyen = BigDecimal.ZERO;
        try {
            phiVanChuyen = DiaChiApi.getFee(phiRequest); // Lấy phí vận chuyển từ API GHN
        } catch (Exception e) {
            e.printStackTrace();
            // Xử lý lỗi nếu không thể lấy phí vận chuyển từ API
            phiVanChuyen = BigDecimal.ZERO;  // Hoặc có thể trả về một giá trị mặc định
        }

        return phiVanChuyen;
    }

    @Transactional
    public DonHang updateDonHang(Integer id, String tenNguoiNhanHang, String diaChiGiaoHang, String sdtNguoiNhan,
                                 String emailNguoiNhan, BigDecimal tongTien, Integer maTinh, Integer maQuan,
                                 String maPhuong, BigDecimal phiVanChuyen) throws Exception {
        // Tìm đơn hàng theo ID
        DonHang donHang = dhi.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn hàng với ID: " + id));

        // Kiểm tra trạng thái đơn hàng (giả sử 0 là "Chờ xử lý")
        if (donHang.getTrangThai() != 0) {
            throw new Exception("Chỉ có thể sửa đơn hàng khi trạng thái là 'Chờ xử lý'!");
        }

        // Cập nhật các trường được yêu cầu
        if (tenNguoiNhanHang != null && !tenNguoiNhanHang.trim().isEmpty()) {
            donHang.setTenNguoiNhanHang(tenNguoiNhanHang);
        }
        if (diaChiGiaoHang != null && !diaChiGiaoHang.trim().isEmpty()) {
            donHang.setDiaChiGiaoHang(diaChiGiaoHang);
        }
        if (sdtNguoiNhan != null && !sdtNguoiNhan.trim().isEmpty()) {
            donHang.setSdtNguoiNhan(sdtNguoiNhan);
        }
        // Giả sử cần thêm trường emailNguoiNhan vào entity DonHang
        // Nếu entity chưa có, bạn cần thêm vào trước
        // donHang.setEmailNguoiNhan(emailNguoiNhan);
        if (tongTien != null && tongTien.compareTo(BigDecimal.ZERO) >= 0) {
            donHang.setTongTien(tongTien);
        }
        if (maTinh != null) {
            donHang.setMaTinh(maTinh);
        }
        if (maQuan != null) {
            donHang.setMaQuan(maQuan);
        }
        if (maPhuong != null && !maPhuong.trim().isEmpty()) {
            donHang.setMaPhuong(maPhuong);
        }
        if (phiVanChuyen != null && phiVanChuyen.compareTo(BigDecimal.ZERO) >= 0) {
            donHang.setPhiVanChuyen(phiVanChuyen);
        }

        // Lưu đơn hàng đã cập nhật vào database
        return dhi.save(donHang);
    }
    public boolean updateOrderStatusToCancelled(Integer orderId) {
        Optional<DonHang> orderOpt = dhi.findById(orderId);

        if (orderOpt.isPresent()) {
            DonHang order = orderOpt.get();

            // Kiểm tra trạng thái hiện tại của đơn hàng
            if (order.getTrangThai() == 1) {  // Trạng thái "Chờ xác nhận"
                order.setTrangThai(5);  // Cập nhật trạng thái thành "Đã huỷ"
                dhi.save(order);  // Lưu lại thay đổi
                return true;
            }
        }

        return false;  // Trả về false nếu không thể cập nhật trạng thái
    }

    private String getStatusName(Integer status) {
        if (status == null) {
            return "KHÔNG XÁC ĐỊNH";
        }
        switch (status) {
            case 1:
                return "CHỜ XÁC NHẬN";
            case 2:
                return "ĐÃ XÁC NHẬN";
            case 3:
                return "ĐANG GIAO";
            case 4:
                return "HOÀN THÀNH";
            case 5:
                return "ĐÃ HUỶ";
            case 6:
                return "THANH TOÁN CHUYỂN KHOẢN";
            default:
                return "KHÔNG XÁC ĐỊNH";
        }
    }
    public DonHang capNhatTrangThaiDonHang(Integer maDonHang, Integer trangThaiMoi, Integer userId, String tenDangNhap, String ghiChuHuy) {
        DonHang donHang = dhi.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + maDonHang));

        // Lưu trạng thái cũ trước khi cập nhật
        Integer trangThaiCu = donHang.getTrangThai();

        // Kiểm tra nếu trạng thái không thay đổi
        if (trangThaiCu.equals(trangThaiMoi)) {
            return donHang; // Không cần cập nhật
        }

        // Cập nhật trạng thái mới cho đơn hàng
        donHang.setTrangThai(trangThaiMoi);
        if (ghiChuHuy != null && !ghiChuHuy.isEmpty()) {
            donHang.setGhiChu(ghiChuHuy);
        }
        dhi.save(donHang);

        // Lưu lịch sử thao tác
        LichSuThaoTac lichSu = new LichSuThaoTac();
        lichSu.setMaDonHang(maDonHang);
        lichSu.setTrangThaiCu(trangThaiCu);
        lichSu.setTrangThaiMoi(trangThaiMoi);
        lichSu.setTaiKhoanId(userId);
        lichSu.setTenTaiKhoan(tenDangNhap);
        lichSu.setGhiChu(ghiChuHuy);
        lichSu.setThoiGianThaoTac(LocalDateTime.now());

        // Định dạng thông điệp thao tác mới
        String thaoTacMessage = String.format(
                "Cập nhật trạng thái đơn hàng từ trạng thái %s  sang trạng thái %s ",
                getStatusName(trangThaiCu),
                getStatusName(trangThaiMoi)
        );
        lichSu.setThaoTac(thaoTacMessage);

        lichSuThaoTacInterface.save(lichSu);

        return donHang;
    }
    public Integer tinhTrangThaiMoi(Integer trangThaiCu, String phuongThucThanhToan, String lyDoHuy) {

        if (lyDoHuy != null && !lyDoHuy.isEmpty()) {
            return 5; // Đã Hủy
        }
        // Logic khác để tính trạng thái mới
        if (trangThaiCu == 3) {
            return 4; // Ví dụ: từ trạng thái 3 (Đang xử lý) sang 4 (Đang giao)
        }
        return trangThaiCu; // Giữ nguyên nếu không có thay đổi
    }
    public DonHang createOfflineOrderService(OrderOfflineRequest orderRequest) throws Exception {
        // Validate the staff account
        if (orderRequest.getUserId() == null) {
            throw new RuntimeException("⚠️ Lỗi: ID tài khoản không được để trống!");
        }

        TaiKhoan taiKhoan = tki.findById(orderRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("⚠️ Lỗi: Tài khoản không tồn tại với ID: " + orderRequest.getUserId()));

        // Validate order items
        if (orderRequest.getChiTietDonHangs() == null || orderRequest.getChiTietDonHangs().isEmpty()) {
            throw new RuntimeException("⚠️ Lỗi: Danh sách sản phẩm không được để trống!");
        }

        // Validate payment method
        if (orderRequest.getPhuongThucThanhToan() == null || orderRequest.getPhuongThucThanhToan().isEmpty()) {
            throw new RuntimeException("⚠️ Lỗi: Phương thức thanh toán không được để trống!");
        }

        // Set creation date
        LocalDateTime ngayTao = LocalDateTime.now();

        // Calculate total amount and prepare order items
        BigDecimal thanhTienGoc = BigDecimal.ZERO;
        List<ChiTietDonHang> chiTietList = new ArrayList<>();

        for (OrderIOfflinetemDto itemDTO : orderRequest.getChiTietDonHangs()) {
            Spct spct = spc.findById(itemDTO.getSpctId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + itemDTO.getSpctId()));

            if (itemDTO.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm phải lớn hơn 0. Sản phẩm ID: " + itemDTO.getSpctId());
            }

            if (itemDTO.getQuantity() > spct.getSoLuongTonKho()) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Sản phẩm ID: " + itemDTO.getSpctId() + " chỉ còn " + spct.getSoLuongTonKho() + " sản phẩm.");
            }

            BigDecimal thanhTien = spct.getDonGia().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            thanhTienGoc = thanhTienGoc.add(thanhTien);

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setSpct(spct);
            chiTiet.setSoLuong(itemDTO.getQuantity());
            chiTiet.setDonGia(spct.getDonGia());
            chiTiet.setThanhTien(thanhTien);

            chiTietList.add(chiTiet);
        }

        // Apply discount if provided
        BigDecimal thanhTienSauGiam = thanhTienGoc;
        PhieuGiamGia phieuGiamGia = null;
        BigDecimal soTienGiam = BigDecimal.ZERO;
        if (orderRequest.getMaGiamGia() != null && !orderRequest.getMaGiamGia().isEmpty()) {
            phieuGiamGia = phieuGiamGiaInterface.findByMaGiamGia(orderRequest.getMaGiamGia())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá không tồn tại hoặc không hợp lệ!"));

            // Chỉ cho phép áp dụng phiếu giảm giá có dieuKienapDung = 0 (offline)
            if (phieuGiamGia.getDieuKienapDung() != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "⚠️ Mã giảm giá này chỉ áp dụng cho đơn hàng online!");
            }

            // Không kiểm tra thời gian hiệu lực và số lượng vì đây là phiếu offline do nhân viên phát

            // Kiểm tra xem tài khoản đã sử dụng mã giảm giá này chưa (tùy bạn có muốn giữ điều kiện này hay không)
            List<DonHang> donHangs = dhi.findByTaiKhoanAndPhieuGiamGia(taiKhoan, phieuGiamGia);


            // Tính toán số tiền giảm
            BigDecimal phanTramGiam = phieuGiamGia.getGiaTriGiam();
            soTienGiam = thanhTienGoc.multiply(phanTramGiam);

            if (phieuGiamGia.getGia_tri_toi_da() != null && soTienGiam.compareTo(phieuGiamGia.getGia_tri_toi_da()) > 0) {
                soTienGiam = phieuGiamGia.getGia_tri_toi_da();
            }

            thanhTienSauGiam = thanhTienGoc.subtract(soTienGiam);
            if (thanhTienSauGiam.compareTo(BigDecimal.ZERO) < 0) {
                thanhTienSauGiam = BigDecimal.ZERO;
            }
        }

        // Total amount (no shipping fee for counter order)
        BigDecimal tongTien = thanhTienSauGiam;

        // Create new order
        DonHang newOrder = new DonHang();
        newOrder.setTaiKhoan(taiKhoan);
        newOrder.setTenNguoiNhanHang(orderRequest.getTenNguoiNhanHang());
        newOrder.setSdtNguoiNhan(orderRequest.getSdtNguoiNhan());
        newOrder.setPhuongThucThanhToan(orderRequest.getPhuongThucThanhToan());
        newOrder.setNgayTao(ngayTao);
        newOrder.setTrangThai(1); // Chờ xác nhận
        newOrder.setGhiChu(orderRequest.getGhiChu());
        newOrder.setTongTien(tongTien);
        newOrder.setLuongBan(0); // Offline order

        if (phieuGiamGia != null) {
            newOrder.setPhieuGiamGia(phieuGiamGia);
            // Không giảm số lượng phiếu giảm giá cho đơn offline
        }

        // Save the order
        DonHang savedOrder = dhi.save(newOrder);

        // Associate order items with the saved order and update stock
        for (ChiTietDonHang chiTiet : chiTietList) {
            chiTiet.setDonHang(savedOrder);
            Spct spct = chiTiet.getSpct();
            spct.setSoLuongTonKho(spct.getSoLuongTonKho() - chiTiet.getSoLuong());
            spc.save(spct);
        }

        cdh.saveAll(chiTietList);
        savedOrder.setChiTietDonHangs(chiTietList);

        return savedOrder;
    }
    public DonHang updateOrderStatus(Integer orderId, UpdateOrderStatusRequest statusRequest) throws Exception {
        DonHang order = dhi.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại với ID: " + orderId));

        int newStatus = statusRequest.getTrangThai();

        // Kiểm tra trạng thái hợp lệ
        if (newStatus != 1 && newStatus != 4 && newStatus != 5) {
            throw new RuntimeException("Trạng thái không hợp lệ! Chỉ chấp nhận: 1 (Chờ xác nhận), 4 (Hoàn tất), 5 (Hủy)");
        }

        // Nếu chuyển sang trạng thái "Hủy" (5), yêu cầu lý do hủy
        if (newStatus == 5) {
            if (statusRequest.getLyDoHuy() == null || statusRequest.getLyDoHuy().isEmpty()) {
                throw new RuntimeException("⚠️ Lỗi: Phải cung cấp lý do hủy khi hủy đơn hàng!");
            }
            // Không cho hủy nếu đơn đã hoàn tất
            if (order.getTrangThai() == 4) {
                throw new RuntimeException("⚠️ Lỗi: Không thể hủy đơn hàng đã hoàn tất!");
            }
            order.setLyDoHuy(statusRequest.getLyDoHuy());
        }

        // Nếu chuyển sang trạng thái "Hoàn tất" (4), không cần lý do hủy
        if (newStatus == 4) {
            order.setLyDoHuy(null); // Xóa lý do hủy nếu có
        }

        order.setTrangThai(newStatus);
        return dhi.save(order);
    }
    public DonHangResponseDTO getOrderById(Integer orderId) throws Exception {
        // Tìm đơn hàng theo ID
        DonHang donHang = dhi.findById(orderId)
                .orElseThrow(() -> new RuntimeException("⚠️ Lỗi: Đơn hàng không tồn tại với ID: " + orderId));

        // Chuyển đổi DonHang thành DonHangResponseDTO
        return DonHangResponseDTO.fromEntity(donHang);
    }
    public DonHangResponseDTO updateOrderAddress(Integer orderId, UpdateOrderAddressDTO updateRequest) throws Exception {
        // Tìm đơn hàng theo ID
        DonHang donhang = dhi.findById(orderId)
                .orElseThrow(() -> new RuntimeException("⚠️ Lỗi: Đơn hàng không tồn tại với ID: " + orderId));

        // Kiểm tra trạng thái đơn hàng (chỉ cho phép cập nhật khi trạng thái là "Chờ xác nhận")
        if (donhang.getTrangThai() != 1) {
            throw new RuntimeException("⚠️ Lỗi: Không thể cập nhật địa chỉ vì đơn hàng không ở trạng thái chờ xác nhận!");
        }

        // Kiểm tra và cập nhật địa chỉ giao hàng (tỉnh, quận, phường)
        if (updateRequest.getMaTinh() != null && updateRequest.getMaQuan() != null && updateRequest.getMaPhuong() != null) {
            // Kiểm tra tỉnh, quận, phường
            Map<Integer, String> tinhList = DiaChiApi.callGetTinhThanhAPI();
            if (!tinhList.containsKey(updateRequest.getMaTinh())) {
                throw new RuntimeException("⚠️ Lỗi: Tỉnh không tồn tại với ID: " + updateRequest.getMaTinh());
            }

            Map<String, String> quanList = DiaChiApi.callGetQuanHuyenAPI(updateRequest.getMaTinh());
            if (!quanList.containsKey(String.valueOf(updateRequest.getMaQuan()))) {
                throw new RuntimeException("⚠️ Lỗi: Quận không tồn tại với ID: " + updateRequest.getMaQuan());
            }

            Map<String, String> phuongList = DiaChiApi.callGetPhuongXaAPI(updateRequest.getMaQuan());
            if (!phuongList.containsKey(updateRequest.getMaPhuong())) {
                throw new RuntimeException("⚠️ Lỗi: Phường không tồn tại với ID: " + updateRequest.getMaPhuong());
            }

            // Cập nhật mã tỉnh, quận, phường
            donhang.setMaTinh(updateRequest.getMaTinh());
            donhang.setMaQuan(updateRequest.getMaQuan());
            donhang.setMaPhuong(updateRequest.getMaPhuong());

            // Lấy tên tỉnh, quận, phường
            String tenTinh = tinhList.get(updateRequest.getMaTinh());
            String tenQuan = quanList.get(String.valueOf(updateRequest.getMaQuan()));
            String tenPhuong = phuongList.get(updateRequest.getMaPhuong());

            // Kiểm tra địa chỉ chi tiết
            if (updateRequest.getDiaChiChiTiet() == null || updateRequest.getDiaChiChiTiet().isEmpty()) {
                throw new RuntimeException("⚠️ Lỗi: Địa chỉ chi tiết không được để trống!");
            }

            // Ghép địa chỉ đầy đủ
            String diaChiGiaoHang = String.format("%s, %s, %s, %s",
                    updateRequest.getDiaChiChiTiet(), tenPhuong, tenQuan, tenTinh);
            donhang.setDiaChiGiaoHang(diaChiGiaoHang);

            // Tính lại phí vận chuyển dựa trên địa chỉ mới
            PhiVanChuyenRequest phiVanChuyenRequest = convertToPhiVanChuyenRequest1(donhang);
            BigDecimal newPhiVanChuyen = DiaChiApi.getFee(phiVanChuyenRequest);
            if (newPhiVanChuyen.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("⚠️ Lỗi: Phí vận chuyển mới không hợp lệ!");
            }

            // Cập nhật phí vận chuyển mới
            donhang.setPhiVanChuyen(newPhiVanChuyen);

            // Tính lại tổng tiền: thanhTienSauGiam + phiVanChuyen mới
            BigDecimal thanhTienGoc = BigDecimal.ZERO;
            for (ChiTietDonHang chiTiet : donhang.getChiTietDonHangs()) {
                thanhTienGoc = thanhTienGoc.add(chiTiet.getThanhTien());
            }

            BigDecimal thanhTienSauGiam = thanhTienGoc;
            if (donhang.getSoTienGiam() != null && donhang.getSoTienGiam().compareTo(BigDecimal.ZERO) > 0) {
                thanhTienSauGiam = thanhTienGoc.subtract(donhang.getSoTienGiam());
            }

            // Tổng tiền mới = thanhTienSauGiam + phí vận chuyển mới
            BigDecimal newTongTien = thanhTienSauGiam.add(newPhiVanChuyen);
            donhang.setTongTien(newTongTien);
        }

        // Cập nhật số điện thoại người nhận nếu có
        if (updateRequest.getSdtNguoiNhan() != null && !updateRequest.getSdtNguoiNhan().isEmpty()) {
            donhang.setSdtNguoiNhan(updateRequest.getSdtNguoiNhan());
        }

        // Cập nhật tên người nhận nếu có
        if (updateRequest.getTenNguoiNhanHang() != null && !updateRequest.getTenNguoiNhanHang().isEmpty()) {
            donhang.setTenNguoiNhanHang(updateRequest.getTenNguoiNhanHang());
        }

        // Lưu đơn hàng đã cập nhật
        DonHang updatedOrder = dhi.save(donhang);
        return DonHangResponseDTO.fromEntity(updatedOrder);
    }
}
