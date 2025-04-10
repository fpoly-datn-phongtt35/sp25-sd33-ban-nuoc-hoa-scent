package com.example.scent.service;

import com.example.scent.dto.CartItemDTO;
import com.example.scent.entity.ChiTietGioHang;
import com.example.scent.entity.GioHang;
import com.example.scent.entity.HinhAnh;
import com.example.scent.entity.Spct;
import com.example.scent.repo.ChiTietGioHangnterface;
import com.example.scent.repo.GioHangInterface;
import com.example.scent.repo.HinhAnhInterface;
import com.example.scent.repo.SpctInterface;

import com.example.scent.reques.InventoryUpdateMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private HinhAnhInterface hinhAnhInterface;

    @Autowired
    private GioHangInterface gioHangInterface;

    @Autowired
    private ChiTietGioHangnterface chiTietGioHangInterface;

    @Autowired
    private SpctInterface spctInterface;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Thêm để gửi thông báo WebSocket

    // Lấy hoặc tạo giỏ hàng cho tài khoản
    @Transactional
    public GioHang getOrCreateCart(Integer idTaiKhoan) {
        GioHang gioHang = gioHangInterface.findByIdTaiKhoanAndTrangThai(idTaiKhoan, 1);
        if (gioHang == null) {
            gioHang = new GioHang();
            gioHang.setIdTaiKhoan(idTaiKhoan);
            gioHang.setNgayTao(LocalDateTime.now());
            gioHang.setTrangThai(1);
            gioHang = gioHangInterface.save(gioHang);
        }
        return gioHang;
    }
    // Thêm sản phẩm vào giỏ hàng
    @Transactional
    public void addToCart(Integer idTaiKhoan, Integer spctId, Integer soLuong) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        Spct spct = spctInterface.findById(spctId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        synchronized (spctId.toString().intern()) { // Khóa theo spctId để tránh xung đột
            ChiTietGioHang chiTiet = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpct(gioHang.getId(), spctId);
            if (chiTiet != null) {
                chiTiet.setSoLuong(chiTiet.getSoLuong() + soLuong);
                chiTiet.setDonGia(spct.getDonGia());
            } else {
                chiTiet = new ChiTietGioHang();
                chiTiet.setGioHang(gioHang);
                chiTiet.setSpct(spct);
                chiTiet.setSoLuong(soLuong);
                chiTiet.setDonGia(spct.getDonGia());
            }
            chiTietGioHangInterface.save(chiTiet);
            // KHÔNG giảm soLuongTonKho ở đây
            // KHÔNG gửi thông báo WebSocket ở đây
        }
    }
    // Lấy danh sách sản phẩm trong giỏ dưới dạng DTO
    public List<CartItemDTO> getCartItems(Integer idTaiKhoan) {
        List<ChiTietGioHang> cartItems = chiTietGioHangInterface.findByGioHangIdTaiKhoan(idTaiKhoan);
        return cartItems.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Chuyển đổi ChiTietGioHang sang CartItemDTO
    private CartItemDTO convertToDTO(ChiTietGioHang chiTiet) {
        Spct spct = chiTiet.getSpct();
        if (spct == null) {
            throw new RuntimeException("Sản phẩm chi tiết không tồn tại: id_spct = " + chiTiet.getSpct());
        }

        List<String> imageUrls = Collections.emptyList();
        if (spct.getSanPham() != null) {
            imageUrls = hinhAnhInterface.findBySanPhamIdSanPham(spct.getSanPham().getIdSanPham())
                    .stream()
                    .map(HinhAnh::getLink)
                    .collect(Collectors.toList());
        }

        return new CartItemDTO(
                chiTiet.getId(),
                chiTiet.getSoLuong(),
                chiTiet.getDonGia(),
                spct.getIdSpct(),
                spct.getDungTich(),
                spct.getSanPham() != null ? spct.getSanPham().getTenSanPham() : "Không xác định",
                imageUrls,
                spct.getSoLuongTonKho()
        );
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    @Transactional
    public void updateCartItem(Integer idTaiKhoan, Integer spctId, Integer soLuong) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        ChiTietGioHang chiTiet = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpct(gioHang.getId(), spctId);
        if (chiTiet == null) {
            throw new RuntimeException("Sản phẩm không có trong giỏ hàng");
        }

        Spct spct = spctInterface.findById(spctId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        synchronized (spctId.toString().intern()) { // Khóa theo spctId
            chiTiet.setSoLuong(soLuong);
            chiTiet.setDonGia(spct.getDonGia());
            chiTietGioHangInterface.save(chiTiet);
            // KHÔNG cập nhật soLuongTonKho ở đây
            // KHÔNG gửi thông báo WebSocket ở đây
        }
    }
    // Xóa sản phẩm khỏi giỏ
    @Transactional
    public void removeFromCart(Integer idTaiKhoan, Integer spctId) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        ChiTietGioHang chiTiet = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpct(gioHang.getId(), spctId);
        if (chiTiet != null) {
            synchronized (spctId.toString().intern()) { // Khóa theo spctId
                chiTietGioHangInterface.delete(chiTiet);
                // KHÔNG tăng soLuongTonKho ở đây
                // KHÔNG gửi thông báo WebSocket ở đây
            }
        }
    }
    // Xóa toàn bộ giỏ hàng
    @Transactional
    public void clearCart(Integer idTaiKhoan) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        List<ChiTietGioHang> cartItems = chiTietGioHangInterface.findByGioHangId(gioHang.getId());
        chiTietGioHangInterface.deleteAll(cartItems);
        // KHÔNG cập nhật soLuongTonKho ở đây
        // KHÔNG gửi thông báo WebSocket ở đây
    }
    // Xóa nhiều sản phẩm khỏi giỏ
    @Transactional
    public void removeMultipleFromCart(Integer idTaiKhoan, List<Integer> spctIds) {
        if (spctIds == null || spctIds.isEmpty()) {
            return;
        }

        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        List<ChiTietGioHang> itemsToRemove = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpctIn(gioHang.getId(), spctIds);

        if (itemsToRemove.isEmpty()) {
            return;
        }

        chiTietGioHangInterface.deleteAll(itemsToRemove);
        // KHÔNG cập nhật soLuongTonKho ở đây
        // KHÔNG gửi thông báo WebSocket ở đây
    }
}