package com.example.scent.service;

import com.example.scent.dto.SpctDTO;
import com.example.scent.dto.spctDTO2;
import com.example.scent.entity.ChiTietDonHang;
import com.example.scent.entity.SanPham;
import com.example.scent.entity.Spct;
import com.example.scent.entity.YeuCauTraHang;
import com.example.scent.repo.CTDHInterface;
import com.example.scent.repo.YeuCauTraHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CTDHSv {
    @Autowired
    CTDHInterface ctdhi;
    @Autowired
    private YeuCauTraHangInterface yeuCauTraHang;
    public List<spctDTO2> getSpctDetailsByDonHang(Integer idDonHang) {
        // Lấy danh sách chi tiết đơn hàng
        List<ChiTietDonHang> chiTietDonHangs = ctdhi.findByDonHangId(idDonHang);
        if (chiTietDonHangs.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy danh sách yêu cầu trả hàng liên quan đến đơn hàng
        List<YeuCauTraHang> yeuCauTraHangs = yeuCauTraHang.findByDonHangId(idDonHang);

        // Chuyển đổi sang spctDTO2 và đánh dấu sản phẩm có yêu cầu trả hàng
        return chiTietDonHangs.stream()
                .map(chiTiet -> {
                    Spct spct = chiTiet.getSpct();
                    SanPham sanPham = spct.getSanPham();
                    Integer maxQuantity = chiTiet.getSoLuong();

                    // Kiểm tra xem sản phẩm có yêu cầu trả hàng hay không
                    Optional<YeuCauTraHang> matchingRequest = yeuCauTraHangs.stream()
                            .filter(req -> req.getSpct().getIdSpct().equals(spct.getIdSpct()))
                            .findFirst();

                    // Kiểm tra xem sản phẩm có yêu cầu trả hàng hay không
                    boolean hasReturnRequest = matchingRequest.isPresent();
                    // Lấy trạng thái từ yêu cầu trả hàng, nếu không có thì để null hoặc giá trị mặc định
                    Integer trangThai = matchingRequest.map(YeuCauTraHang::getTrangThai).orElse(null);
                    return new spctDTO2(
                            spct.getIdSpct(),
                            spct.getDungTich(),
                            spct.getDonGia(),
                            sanPham.getTenSanPham(),
                            sanPham.getIdSanPham(),
                            maxQuantity,
                           trangThai,
                            hasReturnRequest
                    );
                })
                .collect(Collectors.toList());
    }
    public List<ChiTietDonHang> getAll() {
        return ctdhi.findAll();
    }


    public ChiTietDonHang add(ChiTietDonHang ctdh) {
        return ctdhi.save(ctdh);
    }


    public ChiTietDonHang update(ChiTietDonHang ctdh) {
        return ctdhi.save(ctdh);
    }


    public void delete(Integer id) {
        ctdhi.deleteById(id);
    }


    public ChiTietDonHang detail(Integer id) {
        return ctdhi.findById(id).get();
    }
}
