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
            dto.setIdDonHang(danhGia.getDonHang().getId());
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

        // Kiểm tra đơn hàng tồn tại
        DonHang donHang = donHangRepository.findById(danhGiaDTO.getIdDonHang())
                .orElseThrow(() -> new RuntimeException("⚠️ Đơn hàng không tồn tại với ID: " + danhGiaDTO.getIdDonHang()));

        // Kiểm tra xem tài khoản có phải là người đặt đơn hàng này không
        if (!donHang.getTaiKhoan().getId().equals(danhGiaDTO.getIdTaiKhoan())) {
            throw new RuntimeException("⚠️ Bạn không phải là người đặt đơn hàng này!");
        }

        // Kiểm tra trạng thái đơn hàng (trang_thai = 4 là "Hoàn thành")
        if (donHang.getTrangThai() != 4) {
            throw new RuntimeException("⚠️ Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng hoàn thành!");
        }

        // Kiểm tra xem sản phẩm có trong đơn hàng không
        boolean productInOrder = chiTietDonHangRepository.findByDonHangId(donHang.getId()).stream()
                .anyMatch(chiTiet -> chiTiet.getSpct().getSanPham().getIdSanPham().equals(danhGiaDTO.getIdSanPham()));
        if (!productInOrder) {
            throw new RuntimeException("⚠️ Sản phẩm không có trong đơn hàng này!");
        }

        // Kiểm tra xem tài khoản đã đánh giá sản phẩm này trong đơn hàng này chưa
        if (danhGiaRepository.existsBySanPhamIdSanPhamAndTaiKhoanIdAndDonHangId(
                danhGiaDTO.getIdSanPham(), danhGiaDTO.getIdTaiKhoan(), danhGiaDTO.getIdDonHang())) {
            throw new RuntimeException("⚠️ Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi!");
        }

        // Kiểm tra rating hợp lệ (1-5)
        if (danhGiaDTO.getRating() < 1 || danhGiaDTO.getRating() > 5) {
            throw new RuntimeException("⚠️ Đánh giá phải từ 1 đến 5 sao!");
        }

        // Tạo đánh giá mới
        DanhGia danhGia = new DanhGia();
        danhGia.setSanPham(sanPham);
        danhGia.setTaiKhoan(taiKhoan);
        danhGia.setDonHang(donHang);
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
        result.setIdDonHang(savedDanhGia.getDonHang().getId());
        result.setRating(savedDanhGia.getRating());
        result.setComment(savedDanhGia.getComment());
        result.setNgayTao(savedDanhGia.getNgayTao());
        result.setTenNguoiDung(savedDanhGia.getTaiKhoan().getTenDangNhap());

        return result;
    }
    public DanhGiaDTO updateDanhGia(Long id, DanhGiaDTO danhGiaDTO) {
        // Kiểm tra dữ liệu đầu vào
        if (danhGiaDTO.getIdSanPham() == null || danhGiaDTO.getIdTaiKhoan() == null || danhGiaDTO.getIdDonHang() == null) {
            throw new IllegalArgumentException("⚠️ Thiếu thông tin bắt buộc: idSanPham, idTaiKhoan, hoặc idDonHang!");
        }

        // Kiểm tra ID trong DTO có khớp với ID trong URL không
        if (danhGiaDTO.getId() == null || !danhGiaDTO.getId().equals(id)) {
            throw new IllegalArgumentException("⚠️ ID trong DTO không khớp với ID trong URL!");
        }

        // Kiểm tra đánh giá tồn tại
        DanhGia danhGia = danhGiaRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new RuntimeException("⚠️ Đánh giá không tồn tại với ID: " + id));

        // Kiểm tra xem tài khoản có phải là người tạo đánh giá này không
        if (!danhGia.getTaiKhoan().getId().equals(danhGiaDTO.getIdTaiKhoan())) {
            throw new RuntimeException("⚠️ Bạn không có quyền chỉnh sửa đánh giá này!");
        }

        // Kiểm tra đơn hàng tồn tại
        DonHang donHang = donHangRepository.findById(danhGia.getDonHang().getId())
                .orElseThrow(() -> new RuntimeException("⚠️ Đơn hàng không tồn tại với ID: " + danhGia.getDonHang().getId()));

        // Kiểm tra trạng thái đơn hàng (trang_thai = 4 là "Hoàn thành")
        if (donHang.getTrangThai() != 4) {
            throw new RuntimeException("⚠️ Đơn hàng chưa hoàn thành, không thể chỉnh sửa đánh giá!");
        }

        // Kiểm tra rating hợp lệ (1-5)
        if (danhGiaDTO.getRating() == null || danhGiaDTO.getRating() < 1 || danhGiaDTO.getRating() > 5) {
            throw new RuntimeException("⚠️ Đánh giá phải từ 1 đến 5 sao!");
        }

        // Kiểm tra comment không null
        if (danhGiaDTO.getComment() == null || danhGiaDTO.getComment().trim().isEmpty()) {
            throw new RuntimeException("⚠️ Bình luận không được để trống!");
        }

        // Cập nhật thông tin đánh giá
        danhGia.setRating(danhGiaDTO.getRating());
        danhGia.setComment(danhGiaDTO.getComment());
        danhGia.setNgayTao(LocalDateTime.now()); // Cập nhật thời gian chỉnh sửa

        // Lưu đánh giá đã cập nhật
        DanhGia updatedDanhGia = danhGiaRepository.save(danhGia);

        // Chuyển đổi sang DTO để trả về
        DanhGiaDTO result = new DanhGiaDTO();
        result.setId(updatedDanhGia.getId());
        result.setIdSanPham(updatedDanhGia.getSanPham().getIdSanPham().intValue());
        result.setIdTaiKhoan(updatedDanhGia.getTaiKhoan().getId().intValue());
        result.setIdDonHang(updatedDanhGia.getDonHang().getId().intValue());
        result.setRating(updatedDanhGia.getRating());
        result.setComment(updatedDanhGia.getComment());
        result.setNgayTao(updatedDanhGia.getNgayTao());
        result.setTenNguoiDung(updatedDanhGia.getTaiKhoan().getTenDangNhap());

        return result;
    }
    // Xóa đánh giá
    public void deleteDanhGia(Long id, Integer idTaiKhoan) {
        // Kiểm tra đánh giá tồn tại
        DanhGia danhGia = danhGiaRepository.findById(id.longValue())
                .orElseThrow(() -> new RuntimeException("⚠️ Đánh giá không tồn tại với ID: " + id));

        // Kiểm tra xem tài khoản có phải là người tạo đánh giá này không
        if (!danhGia.getTaiKhoan().getId().equals(idTaiKhoan)) {
            throw new RuntimeException("⚠️ Bạn không có quyền xóa đánh giá này!");
        }

        // Kiểm tra đơn hàng tồn tại
        DonHang donHang = donHangRepository.findById(danhGia.getDonHang().getId())
                .orElseThrow(() -> new RuntimeException("⚠️ Đơn hàng không tồn tại với ID: " + danhGia.getDonHang().getId()));

        // Kiểm tra trạng thái đơn hàng (trang_thai = 4 là "Hoàn thành")
        if (donHang.getTrangThai() != 4) {
            throw new RuntimeException("⚠️ Đơn hàng chưa hoàn thành, không thể xóa đánh giá!");
        }

        // Xóa đánh giá
        danhGiaRepository.deleteById(id.longValue());
    }
    public DanhGiaDTO getUserDanhGia(Integer idSanPham, Integer idTaiKhoan, Integer idDonHang) {
        DanhGia danhGia = danhGiaRepository.findBySanPhamIdSanPhamAndTaiKhoanIdAndDonHangId(
                        idSanPham, idTaiKhoan, idDonHang)
                .orElse(null);

        if (danhGia == null) {
            return null; // Trả về null nếu không tìm thấy đánh giá
        }

        // Chuyển đổi sang DTO
        DanhGiaDTO result = new DanhGiaDTO();
        result.setId(danhGia.getId());
        result.setIdSanPham(danhGia.getSanPham().getIdSanPham().intValue());
        result.setIdTaiKhoan(danhGia.getTaiKhoan().getId().intValue());
        result.setIdDonHang(danhGia.getDonHang().getId().intValue());
        result.setRating(danhGia.getRating());
        result.setComment(danhGia.getComment());
        result.setNgayTao(danhGia.getNgayTao());
        result.setTenNguoiDung(danhGia.getTaiKhoan().getTenDangNhap());

        return result;
    }
}