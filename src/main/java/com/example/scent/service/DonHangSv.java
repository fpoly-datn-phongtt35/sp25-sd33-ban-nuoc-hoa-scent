package com.example.scent.service;


import com.example.scent.dto.*;
import com.example.scent.entity.*;
import com.example.scent.repo.*;
import com.example.scent.reques.PhiVanChuyenRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class DonHangSv {
    private static final Logger log = LoggerFactory.getLogger(DonHangSv.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    TinhInterface tinhInterface;
    @Autowired
    QuanInterface quanInterface;
    @Autowired
    PhuongInterface phuongInterface;

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
        if (orderRequest.getIdTaiKhoan() == null) {
            throw new RuntimeException("⚠️ Lỗi: ID tài khoản không được để trống!");
        }

        TaiKhoan taiKhoan = tki.findById(orderRequest.getIdTaiKhoan())
                .orElseThrow(() -> new RuntimeException("⚠️ Lỗi: Tài khoản không tồn tại với ID: " + orderRequest.getIdTaiKhoan()));

        // Lấy thông tin từ API GHN thay vì cơ sở dữ liệu
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

        PhiVanChuyenRequest phiVanChuyenRequest = convertToPhiVanChuyenRequest(orderRequest);
        BigDecimal phiVanChuyen = DiaChiApi.getFee(phiVanChuyenRequest);
        if (phiVanChuyen.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("⚠️ Lỗi: Phí vận chuyển không hợp lệ!");
        }
        BigDecimal tongTien = BigDecimal.ZERO;

        List<ChiTietDonHang> chiTietList = new ArrayList<>();

        for (OrderItemDto itemDTO : orderRequest.getChiTietDonHangs()) {
            Spct spct = spc.findById(itemDTO.getSpctId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + itemDTO.getSpctId()));

            if (itemDTO.getQuantity() > spct.getSoLuongTonKho()) {
                throw new RuntimeException("Số lượng sản phẩm không đủ. Sản phẩm ID: " + itemDTO.getSpctId() + " chỉ còn " + spct.getSoLuongTonKho() + " sản phẩm.");
            }
            BigDecimal thanhTien = spct.getDonGia().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            tongTien = tongTien.add(thanhTien);


            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setSpct(spct);
            chiTiet.setSoLuong(itemDTO.getQuantity());
            chiTiet.setDonGia(spct.getDonGia());
            chiTiet.setThanhTien(thanhTien);

            // 🔥 Lấy danh sách hình ảnh từ `HinhAnhRepository`
            List<String> productImages = hinhAnhInterface.findBySanPhamId(spct.getSanPham().getIdSanPham())
                    .stream()
                    .map(HinhAnh::getLink)
                    .collect(Collectors.toList());

            itemDTO.setImageURL(productImages); // Gán danh sách ảnh vào OrderItemDto
            System.out.println("Hình ảnh sản phẩm ID " + spct.getSanPham().getIdSanPham() + ": " + productImages);
            spct.setImageUrl(productImages);
            spct.setSoLuongTonKho(spct.getSoLuongTonKho());
            chiTietList.add(chiTiet);

        }
        tongTien = tongTien.add(phiVanChuyen);
        // Tạo đơn hàng mới
        DonHang newOrder = new DonHang();
        newOrder.setTaiKhoan(taiKhoan);
        newOrder.setTenNguoiNhanHang(orderRequest.getTenNguoiNhanHang());
        newOrder.setDiaChiGiaoHang(orderRequest.getDiaChiGiaoHang());
        newOrder.setSdtNguoiNhan(orderRequest.getSdtNguoiNhan());
        newOrder.setPhuongThucVanChuyen(orderRequest.getPhuongThucVanChuyen());
        newOrder.setPhuongThucThanhToan(orderRequest.getPhuongThucThanhToan());
        newOrder.setNgayTao(orderRequest.getNgayTao() != null ? orderRequest.getNgayTao() : LocalDateTime.now());
        newOrder.setNgayVanChuyen(orderRequest.getNgayVanChuyen());
        newOrder.setTrangThai(1);
        newOrder.setGhiChu(orderRequest.getGhichu());
        // Tạo và thiết lập đối tượng Tinh
        newOrder.setPhiVanChuyen(phiVanChuyen);
        newOrder.setGhiChu(orderRequest.getGhichu());
        newOrder.setMaTinh(orderRequest.getMaTinh());
        newOrder.setMaQuan(orderRequest.getMaQuan());
newOrder.setMaPhuong(orderRequest.getMaPhuong());

        newOrder.setTongTien(tongTien);
        DonHang savedOrder = dhi.save(newOrder);

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
            List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamId(id);
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
        donHangDTO.setSdtNguoiNhan(donHang.getSdtNguoiNhan());
        donHangDTO.setPhuongThucVanChuyen(donHang.getPhuongThucVanChuyen());
        donHangDTO.setPhuongThucThanhToan(donHang.getPhuongThucThanhToan());
        donHangDTO.setNgayTao(donHang.getNgayTao());
        donHangDTO.setNgayVanChuyen(donHang.getNgayVanChuyen());
        donHangDTO.setTongTien(donHang.getTongTien());
        donHangDTO.setTrangThai(donHang.getTrangThai());
        donHangDTO.setGhichu(donHang.getGhiChu());

        // Chuyển đổi chi tiết đơn hàng
        List<OrderItemDTOID> chiTietList = cdh.findByDonHangId(donHang.getId())
                .stream()
                .map(chiTiet -> {
                    OrderItemDTOID itemDto = new OrderItemDTOID();
                    itemDto.setSpctId(chiTiet.getSpct().getIdSpct());
                    itemDto.setQuantity(chiTiet.getSoLuong());
                    itemDto.setDonGia(chiTiet.getDonGia());
                    itemDto.setThanhTien(chiTiet.getThanhTien());

                    // Lấy hình ảnh của sản phẩm
                    List<String> productImages = hinhAnhInterface.findBySanPhamId(chiTiet.getSpct().getSanPham().getIdSanPham())
                            .stream()
                            .map(HinhAnh::getLink)
                            .collect(Collectors.toList());

                    itemDto.setImageURL(productImages);
                    return itemDto;
                })
                .collect(Collectors.toList());

        donHangDTO.setChiTietDonHangs(chiTietList);

        return donHangDTO;
    }).collect(Collectors.toList());
}
    @Transactional
    public void savePhuongToDB(String maPhuong, String tenPhuong) {
        // Kiểm tra xem phường đã có trong cơ sở dữ liệu chưa
        Phuong existingPhuong = phuongInterface.findByMaPhuong(maPhuong).orElse(null);

        if (existingPhuong == null) {
            // Phường chưa có, lưu mới
            Phuong newPhuong = new Phuong();
            newPhuong.setMaPhuong(maPhuong);
            newPhuong.setTenPhuong(tenPhuong);  // Lấy tên phường từ API GHN
            phuongInterface.save(newPhuong);  // Lưu vào cơ sở dữ liệu
        } else {
            // Nếu phường đã tồn tại, chỉ cần làm mới thông tin nếu cần
            entityManager.refresh(existingPhuong);  // Làm mới đối tượng phường từ cơ sở dữ liệu
        }
    }
    @Transactional
    public void saveQuanToDB(Integer maQuan, String tenQuan) {
        // Kiểm tra xem quận đã có trong cơ sở dữ liệu chưa
        quan existingQuan = quanInterface.findByMaQuan(maQuan).orElse(null);

        if (existingQuan == null) {
            // Quận chưa có, lưu mới
            quan newQuan = new quan();
            newQuan.setMaQuan(maQuan);
            newQuan.setTenQuan(tenQuan);  // Lấy tên quận từ API GHN
            quanInterface.save(newQuan);  // Lưu vào cơ sở dữ liệu
        } else {
            // Nếu quận đã tồn tại, chỉ cần làm mới thông tin nếu cần
            entityManager.refresh(existingQuan);  // Làm mới đối tượng quận từ cơ sở dữ liệu
        }
    }
    @Transactional
    public void saveTinhToDB(Integer maTinh, String tenTinh) {
        // Kiểm tra xem tỉnh đã có trong cơ sở dữ liệu chưa
        tinh existingTinh = tinhInterface.findByMaTinh(maTinh).orElse(null);

        if (existingTinh == null) {
            // Tỉnh chưa có, lưu mới
            tinh newTinh = new tinh();
            newTinh.setMaTinh(maTinh);
            newTinh.setTenTinh(tenTinh);  // Lấy tên tỉnh từ API GHN
            tinhInterface.save(newTinh);  // Lưu vào cơ sở dữ liệu
        } else {
            // Nếu tỉnh đã tồn tại, chỉ cần làm mới thông tin nếu cần
            entityManager.refresh(existingTinh);  // Làm mới đối tượng tỉnh từ cơ sở dữ liệu
        }
    }

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
    public void importData() throws Exception {
        // Lấy danh sách tỉnh từ API GHN
        HashMap<Integer, String> tinhList = DiaChiApi.callGetTinhThanhAPI();
        System.out.println("DS tinh : " + tinhList); // Log danh sách tỉnh
        if (tinhList == null || tinhList.isEmpty()) {
            System.out.println("Dữ liệu Tỉnh không có hoặc bị lỗi!");
        }
        for (Map.Entry<Integer, String> entry : tinhList.entrySet()) {
            tinh tinhEntity = tinhInterface.findById(entry.getKey()).orElse(null);
            if (tinhEntity == null) { // Nếu tỉnh chưa tồn tại thì lưu vào DB
                tinhEntity = new tinh();
                tinhEntity.setMaTinh(entry.getKey());
                tinhEntity.setTenTinh(entry.getValue());
                try {
                    tinhInterface.save(tinhEntity);  // Lưu vào DB
                    System.out.println("Lưu Tỉnh vào DB: " + entry.getKey() + " - " + entry.getValue());
                } catch (Exception e) {
                    log.error("Failed to save Tinh with ID: {}", entry.getKey(), e);
                }
            } else {
                System.out.println("Tỉnh đã tồn tại trong DB: " + entry.getKey() + " - " + entry.getValue());
            }
        }

        // Lấy danh sách quận từ API GHN
        for (Map.Entry<Integer, String> entry : tinhList.entrySet()) {
            HashMap<String, String> quanList = DiaChiApi.callGetQuanHuyenAPI(entry.getKey());
            System.out.println("DS QUAN : " + quanList); // Log danh sách quận
            for (Map.Entry<String, String> quanEntry : quanList.entrySet()) {
                quan quanEntity = new quan();
                quanEntity.setMaQuan(Integer.parseInt(quanEntry.getKey())); // Chuyển String thành Integer
                quanEntity.setTenQuan(quanEntry.getValue());

                // Tìm Tỉnh từ ID
                tinh tinhEntity = tinhInterface.findById(entry.getKey()).orElse(null);
                if (tinhEntity != null) {
                    quanEntity.setTinh(tinhEntity);
                    try {
                        quanInterface.save(quanEntity); // Lưu vào DB
                        System.out.println("Lưu Quận vào DB: " + quanEntry.getKey() + " - " + quanEntry.getValue());
                    } catch (Exception e) {
                        log.error("Failed to save Quan with ID: {}", quanEntity.getMaQuan(), e);
                    }
                } else {
                    log.error("Tinh with ID {} not found", entry.getKey());
                }
            }
        }

        // Lấy danh sách phường từ API GHN
        for (Map.Entry<Integer, String> entry : tinhList.entrySet()) {
            HashMap<String, String> phuongList = DiaChiApi.callGetPhuongXaAPI(entry.getKey());
            System.out.println("DS phuong : " + phuongList); // Log danh sách phường
            if (phuongList != null && !phuongList.isEmpty()) {
                for (Map.Entry<String, String> phuongEntry : phuongList.entrySet()) {
                    Phuong phuongEntity = new Phuong();
                    phuongEntity.setMaPhuong(phuongEntry.getKey());
                    phuongEntity.setTenPhuong(phuongEntry.getValue());

                    // Tìm Quận từ ID
                    quan quanEntity = quanInterface.findByMaQuan(Integer.parseInt(phuongEntry.getKey())).orElse(null);
                    if (quanEntity != null) {
                        phuongEntity.setQuan(quanEntity);
                        try {
                            phuongInterface.save(phuongEntity); // Lưu vào DB
                            System.out.println("Lưu Phường vào DB: " + phuongEntry.getKey() + " - " + phuongEntry.getValue());
                        } catch (Exception e) {
                            log.error("Failed to save Phuong with ID: {}", phuongEntity.getMaPhuong(), e);
                        }
                    } else {
                        log.error("Quan with ID {} not found", phuongEntry.getKey());
                    }
                }
            } else {
                log.warn("No phuong xa found for district ID: {}", entry.getKey());
            }
        }
    }


}
