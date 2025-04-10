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
import org.springframework.beans.factory.annotation.Autowired;
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

        if (soLuong > spct.getSoLuongTonKho()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

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
    }

    // Lấy danh sách sản phẩm trong giỏ dưới dạng DTO
    public List<CartItemDTO> getCartItems(Integer idTaiKhoan) {
        // Sửa để sử dụng findByGioHangIdTaiKhoan thay vì findByGioHangId
        List<ChiTietGioHang> cartItems = chiTietGioHangInterface.findByGioHangIdTaiKhoan(idTaiKhoan);
        return cartItems.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Chuyển đổi ChiTietGioHang sang CartItemDTO
    private CartItemDTO convertToDTO(ChiTietGioHang chiTiet) {
        Spct spct = chiTiet.getSpct();
        if (spct == null) {
            throw new RuntimeException("Sản phẩm chi tiết không tồn tại: id_spct = " + chiTiet.getSpct());
        }

        List<String> imageUrls = Collections.emptyList(); // Mặc định là danh sách rỗng
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
                imageUrls
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
        if (soLuong > spct.getSoLuongTonKho()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        chiTiet.setSoLuong(soLuong);
        chiTiet.setDonGia(spct.getDonGia());
        chiTietGioHangInterface.save(chiTiet);
    }

    // Xóa sản phẩm khỏi giỏ
    @Transactional
    public void removeFromCart(Integer idTaiKhoan, Integer spctId) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        ChiTietGioHang chiTiet = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpct(gioHang.getId(), spctId);
        if (chiTiet != null) {
            chiTietGioHangInterface.delete(chiTiet);
        }
    }

    // Xóa toàn bộ giỏ hàng
    @Transactional
    public void clearCart(Integer idTaiKhoan) {
        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        chiTietGioHangInterface.deleteAll(chiTietGioHangInterface.findByGioHangId(gioHang.getId()));
    }
    @Transactional
    public void removeMultipleFromCart(Integer idTaiKhoan, List<Integer> spctIds) {
        if (spctIds == null || spctIds.isEmpty()) {
            return; // Không có gì để xóa
        }

        GioHang gioHang = getOrCreateCart(idTaiKhoan);
        List<ChiTietGioHang> itemsToRemove = chiTietGioHangInterface.findByGioHangIdAndSpctIdSpctIn(gioHang.getId(), spctIds);

        if (itemsToRemove.isEmpty()) {
            return; // Không tìm thấy sản phẩm nào trong giỏ để xóa
        }

        try {
            chiTietGioHangInterface.deleteAll(itemsToRemove);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa nhiều sản phẩm khỏi giỏ hàng: " + e.getMessage(), e);
        }
    }
}