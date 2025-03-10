package com.example.scent.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonHangDTO {
    private Integer idTaiKhoan;
    private String tenNguoiNhanHang;
    private String diaChiGiaoHang;
    private String sdtNguoiNhan;
    private String phuongThucVanChuyen;
    private String phuongThucThanhToan;
    private LocalDateTime ngayTao =LocalDateTime.now();
    private LocalDateTime ngayVanChuyen;
    private List<OrderItemDto> chiTietDonHangs;
    private List<String> imageURL;
}
