package com.example.scent.service;


import com.example.scent.dto.DonHangDTO;
import com.example.scent.dto.OrderItemDto;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.dto.donhangDetailDTO;
import com.example.scent.entity.*;
import com.example.scent.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DonHangSv {
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

    public Page<DonHang> getDonHangByTrangThai(Pageable pageable,Integer trangThai) {
        return dhi.findByTrangThai(pageable,trangThai);
    }

    @Transactional

    public DonHang createOrder(DonHangDTO orderRequest) {
        if (orderRequest.getIdTaiKhoan() == null) {
            throw new RuntimeException("⚠️ Lỗi: ID tài khoản không được để trống!");
        }

        TaiKhoan taiKhoan = tki.findById(orderRequest.getIdTaiKhoan())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại với ID: " + orderRequest.getIdTaiKhoan()));

        LocalDateTime ngayTao = (orderRequest.getNgayTao() != null) ? orderRequest.getNgayTao() : LocalDateTime.now();
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

        DonHang newOrder = new DonHang();
        newOrder.setTaiKhoan(taiKhoan);
        newOrder.setTenNguoiNhanHang(orderRequest.getTenNguoiNhanHang());
        newOrder.setDiaChiGiaoHang(orderRequest.getDiaChiGiaoHang());
        newOrder.setSdtNguoiNhan(orderRequest.getSdtNguoiNhan());
        newOrder.setPhuongThucVanChuyen(orderRequest.getPhuongThucVanChuyen());
        newOrder.setPhuongThucThanhToan(orderRequest.getPhuongThucThanhToan());
        newOrder.setNgayTao(ngayTao);
        newOrder.setNgayVanChuyen(orderRequest.getNgayVanChuyen());
        newOrder.setTongTien(tongTien);
        newOrder.setTrangThai(1);
        newOrder.setGhiChu(orderRequest.getGhichu());

        DonHang savedOrder = dhi.save(newOrder);

        for (ChiTietDonHang chiTiet : chiTietList) {
            chiTiet.setDonHang(savedOrder);
        }

        cdh.saveAll(chiTietList);

        savedOrder.setChiTietDonHangs(chiTietList);

        return savedOrder;
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

    public Page<DonHang> getPageDonHang(int page, int size, int trangThai) {
        Pageable pageable = PageRequest.of(page, size);

        Page<DonHang> donHangPage;

        // Nếu status không phải là -1 (tức là có lọc trạng thái), sử dụng phương thức findByStatus
        if (trangThai != -1) {
            donHangPage = dhi.findByTrangThai(pageable, trangThai);
        } else {
            // Nếu không lọc trạng thái, lấy tất cả đơn hàng
            donHangPage = dhi.findAll(pageable);
        }

        // Lấy các ID sản phẩm từ các đơn hàng trong trang
        List<Integer> sanPhamIds = donHangPage.getContent().stream()
                .flatMap(dh -> dh.getChiTietDonHangs().stream())
                .map(ctdh -> ctdh.getSpct().getSanPham().getIdSanPham())
                .distinct()
                .collect(Collectors.toList());

        // Lấy hình ảnh tương ứng cho mỗi sản phẩm
        Map<Integer, List<String>> imageMap = getHinhAnhBySanPhamIds(sanPhamIds);

        // Gán hình ảnh vào SPCT
        donHangPage.getContent().forEach(dh -> {
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




}
