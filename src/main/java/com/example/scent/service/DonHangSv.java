package com.example.scent.service;


import com.example.scent.dto.DonHangDTO;
import com.example.scent.dto.OrderItemDto;
import com.example.scent.dto.SanPhamThongKeDto;
import com.example.scent.entity.*;
import com.example.scent.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    public List<DonHang> getDonHangByTrangThai(Integer trangThai) {
        return dhi.findByTrangThai(trangThai);
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
            spct.setSoLuongTonKho(spct.getSoLuongTonKho() - itemDTO.getQuantity());
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

        DonHang savedOrder = dhi.save(newOrder);

        for (ChiTietDonHang chiTiet : chiTietList) {
            chiTiet.setDonHang(savedOrder);
        }

        cdh.saveAll(chiTietList);

        savedOrder.setChiTietDonHangs(chiTietList);

        return savedOrder;
    }

    public Page<DonHang> getPageDonHang(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dhi.findAll(pageable);
    }
}
