package com.example.scent.service;


import com.example.scent.dto.*;
import com.example.scent.entity.*;
import com.example.scent.repo.*;
import com.example.scent.reques.PhiVanChuyenRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
            donHangPage = dhi.findAll();  // Lấy tất cả các đơn hàng
        }

        // Lấy các ID sản phẩm từ các đơn hàng
        List<Integer> sanPhamIds = donHangPage.stream()
                .flatMap(dh -> dh.getChiTietDonHangs().stream())
                .map(ctdh -> ctdh.getSpct().getSanPham().getIdSanPham())
                .distinct()
                .collect(Collectors.toList());

        // Lấy hình ảnh tương ứng cho mỗi sản phẩm
        Map<Integer, List<String>> imageMap = getHinhAnhBySanPhamIds(sanPhamIds);

        // Gán hình ảnh vào SPCT cho mỗi đơn hàng
        donHangPage.forEach(dh -> {
            dh.getChiTietDonHangs().forEach(ctdh -> {
                Spct spct = ctdh.getSpct();
                SanPham sp = spct.getSanPham();
                if (imageMap.containsKey(sp.getIdSanPham())) {
                    spct.setImageUrl(imageMap.get(sp.getIdSanPham()));  // Gán danh sách URL hình ảnh
                }
            });
            BigDecimal soTienGiam = BigDecimal.ZERO;

            if (dh.getPhieuGiamGia() != null && dh.getPhieuGiamGia().getGiaTriGiam() != null) {
                BigDecimal phanTram = dh.getPhieuGiamGia().getGiaTriGiam();
                // ví dụ: 15.0
                BigDecimal thanhTienGoc = BigDecimal.ZERO;

                // Tính tổng (đơn giá * số lượng) của từng sản phẩm
                for (ChiTietDonHang ctdh : dh.getChiTietDonHangs()) {
                    BigDecimal donGia = ctdh.getDonGia();
                    BigDecimal soLuong = BigDecimal.valueOf(ctdh.getSoLuong());
                    thanhTienGoc = thanhTienGoc.add(donGia.multiply(soLuong));
                }

                // Tính số tiền giảm
                soTienGiam = thanhTienGoc.multiply(phanTram).divide(BigDecimal.valueOf(100));
            }

            dh.setSoTienGiam(soTienGiam);

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

    // Chuyển đổi sang DonHangDTO
    return donHangs.stream().map(donHang -> {
        donhangDTOID donHangDTO = new donhangDTOID();
        donHangDTO.setIdTaiKhoan(donHang.getTaiKhoan().getId());
        donHangDTO.setTenNguoiNhanHang(donHang.getTenNguoiNhanHang());
        donHangDTO.setDiaChiGiaoHang(donHang.getDiaChiGiaoHang());
        donHangDTO.setMaDonHang(donHang.getId());
        donHangDTO.setSdtNguoiNhan(donHang.getSdtNguoiNhan());
        donHangDTO.setPhuongThucVanChuyen(donHang.getPhuongThucVanChuyen());
        donHangDTO.setPhuongThucThanhToan(donHang.getPhuongThucThanhToan());
        donHangDTO.setNgayTao(donHang.getNgayTao());
        donHangDTO.setNgayVanChuyen(donHang.getNgayVanChuyen());
        donHangDTO.setTongTien(donHang.getTongTien());
        donHangDTO.setTrangThai(donHang.getTrangThai());
        donHangDTO.setGhichu(donHang.getGhiChu());
        donHangDTO.setPhiVanChuyen(donHang.getPhiVanChuyen());
        // Gán mã phiếu giảm giá (nếu có)
        donHangDTO.setPhieuGiamGia(donHang.getPhieuGiamGia() != null ? donHang.getPhieuGiamGia().getMaGiamGia() : null);

        // Chuyển đổi chi tiết đơn hàng
        List<OrderItemDTOID> chiTietList = cdh.findByDonHangId(donHang.getId())
                .stream()
                .map(chiTiet -> {
                    OrderItemDTOID itemDto = new OrderItemDTOID();
                    itemDto.setSpctId(chiTiet.getSpct().getIdSpct());
                    itemDto.setQuantity(chiTiet.getSoLuong());
                    itemDto.setDonGia(chiTiet.getDonGia());
                    itemDto.setThanhTien(chiTiet.getThanhTien());
                    itemDto.setTenSanPham(chiTiet.getSpct().getSanPham().getTenSanPham());

                    // Tính số tiền giảm giá: (số lượng * đơn giá) * giá trị giảm
                    BigDecimal quantity = new BigDecimal(chiTiet.getSoLuong()); // Số lượng
                    BigDecimal unitPrice = new BigDecimal(String.valueOf(chiTiet.getDonGia())); // Đơn giá
                    BigDecimal totalPriceBeforeDiscount = quantity.multiply(unitPrice); // Tổng tiền trước giảm giá

                    // Lấy giá trị giảm (giaTriGiam) từ PhieuGiamGia (nếu có)
                    BigDecimal giaTriGiam = donHang.getPhieuGiamGia() != null
                            ? donHang.getPhieuGiamGia().getGiaTriGiam()
                            : BigDecimal.ZERO;

                    // Tính số tiền giảm: (số lượng * đơn giá) * giá trị giảm
                    BigDecimal soTienGiam = totalPriceBeforeDiscount.multiply(giaTriGiam);

                    // Gán số tiền giảm vào DTO
                    itemDto.setSoTienGiamGia(soTienGiam);

                    // Lấy hình ảnh của sản phẩm
                    List<String> productImages = hinhAnhInterface.findHinhAnhBySanPhamId(chiTiet.getSpct().getSanPham().getIdSanPham())
                            .stream()
                            .map(HinhAnh::getLink)
                            .collect(Collectors.toList());
                    itemDto.setImageURL(productImages);

                    return itemDto;
                })
                .collect(Collectors.toList());

        donHangDTO.setChiTietDonHangs(chiTietList);

        // Tính tổng số tiền giảm giá cho toàn bộ đơn hàng
        BigDecimal totalDiscount = chiTietList.stream()
                .map(OrderItemDTOID::getSoTienGiamGia)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        donHangDTO.setSoTienGiam(totalDiscount);

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
        lichSu.setThaoTac("Cập nhật trạng thái đơn hàng từ trạng thái "
                + trangThaiCu + " sang trạng thái " + trangThaiMoi);


        lichSuThaoTacInterface.save(lichSu);



        return donHang;
    }
    // Phương thức tính trạng thái mới (giả định)
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
}
