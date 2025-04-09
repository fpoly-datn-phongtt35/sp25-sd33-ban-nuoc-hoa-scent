package com.example.scent.service;
import com.example.scent.dto.DanhGiaDTO;
import com.example.scent.entity.DanhGia;
import com.example.scent.entity.DonHang;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DanhGiaService {

    @Autowired
    private DanhGiaInterface danhGiaRepository;

    @Autowired
    private SanPhamInterface sanPhamRepository;

    @Autowired
    private TaiKhoanInterface taiKhoanRepository;

    @Autowired
    private DonHangInterface donHangRepository;

    @Autowired
    private CTDHInterface chiTietDonHangRepository;

    // Lấy danh sách đánh giá của một sản phẩm
    public List<DanhGiaDTO> getDanhGiaBySanPham(Integer idSanPham) {
        List<DanhGia> danhGias = danhGiaRepository.findBySanPhamIdSanPham(idSanPham);
        return danhGias.stream().map(danhGia -> {
            DanhGiaDTO dto = new DanhGiaDTO();
            dto.setId(danhGia.getId());
            dto.setIdSanPham(danhGia.getSanPham().getIdSanPham());
            dto.setIdTaiKhoan(danhGia.getTaiKhoan().getId());
            dto.setRating(danhGia.getRating());
            dto.setComment(danhGia.getComment());
            dto.setNgayTao(danhGia.getNgayTao());
            dto.setTenNguoiDung(danhGia.getTaiKhoan().getTenDangNhap());
            return dto;
        }).collect(Collectors.toList());
    }

    // Thêm đánh giá mới
    public DanhGiaDTO addDanhGia(DanhGiaDTO danhGiaDTO) {
        // Kiểm tra sản phẩm tồn tại
        SanPham sanPham = sanPhamRepository.findById(danhGiaDTO.getIdSanPham())
                .orElseThrow(() -> new RuntimeException("⚠️ Sản phẩm không tồn tại với ID: " + danhGiaDTO.getIdSanPham()));

        // Kiểm tra tài khoản tồn tại
        TaiKhoan taiKhoan = taiKhoanRepository.findById(danhGiaDTO.getIdTaiKhoan())
                .orElseThrow(() -> new RuntimeException("⚠️ Tài khoản không tồn tại với ID: " + danhGiaDTO.getIdTaiKhoan()));

        // Kiểm tra xem tài khoản đã mua sản phẩm này chưa
        List<DonHang> donHangs = donHangRepository.findByTaiKhoanId(danhGiaDTO.getIdTaiKhoan());
        boolean hasPurchased = false;
        boolean isOrderCompleted = false;

        for (DonHang donHang : donHangs) {
            // Kiểm tra trạng thái đơn hàng
            if (donHang.getTrangThai() == 4) { // Giả sử trạng thái 4 là "Hoàn thành"
                boolean productInOrder = chiTietDonHangRepository.findByDonHangId(donHang.getId()).stream()
                        .anyMatch(chiTiet -> chiTiet.getSpct().getSanPham().getIdSanPham().equals(danhGiaDTO.getIdSanPham()));
                if (productInOrder) {
                    hasPurchased = true;
                    isOrderCompleted = true;
                    break;
                }
            }
        }

        if (!hasPurchased) {
            throw new RuntimeException("⚠️ Bạn chỉ có thể đánh giá sản phẩm sau khi mua hàng!");
        }

        if (!isOrderCompleted) {
            throw new RuntimeException("⚠️ Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng hoàn thành!");
        }

        // Kiểm tra xem tài khoản đã đánh giá sản phẩm này chưa
        if (danhGiaRepository.existsBySanPhamIdSanPhamAndTaiKhoanId(danhGiaDTO.getIdSanPham(), danhGiaDTO.getIdTaiKhoan())) {
            throw new RuntimeException("⚠️ Bạn đã đánh giá sản phẩm này rồi!");
        }

        // Kiểm tra rating hợp lệ (1-5)
        if (danhGiaDTO.getRating() < 1 || danhGiaDTO.getRating() > 5) {
            throw new RuntimeException("⚠️ Đánh giá phải từ 1 đến 5 sao!");
        }

        // Tạo đánh giá mới
        DanhGia danhGia = new DanhGia();
        danhGia.setSanPham(sanPham);
        danhGia.setTaiKhoan(taiKhoan);
        danhGia.setRating(danhGiaDTO.getRating());
        danhGia.setComment(danhGiaDTO.getComment());
        danhGia.setNgayTao(LocalDateTime.now());

        // Lưu đánh giá
        DanhGia savedDanhGia = danhGiaRepository.save(danhGia);

        // Chuyển đổi sang DTO để trả về
        DanhGiaDTO result = new DanhGiaDTO();
        result.setId(savedDanhGia.getId());
        result.setIdSanPham(savedDanhGia.getSanPham().getIdSanPham());
        result.setIdTaiKhoan(savedDanhGia.getTaiKhoan().getId());
        result.setRating(savedDanhGia.getRating());
        result.setComment(savedDanhGia.getComment());
        result.setNgayTao(savedDanhGia.getNgayTao());
        result.setTenNguoiDung(savedDanhGia.getTaiKhoan().getTenDangNhap());

        return result;
    }
}