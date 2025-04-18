package com.example.scent.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BestSellingSanPhamInfoDTO {
    private Integer idSanPham;
    private String tenSanPham;
    private BigDecimal donGia;
    private String imageURL;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String moTaHuongDau;
    private String moTaHuongGiua;
    private String moTaHuongCuoi;
    private Integer idNhomHuong;
    private String tenNhomHuong;
    private String quocGia;
    private Integer trangThai;
    private Integer tongSoLuongTonKho;
    private LocalDateTime createDate;
    private Long totalQuantitySold;

    // Constructor matching the query
    public BestSellingSanPhamInfoDTO(
            Integer idSanPham,
            String tenSanPham,
            BigDecimal donGia,
            String imageURL,
            String tenThuongHieu,
            String tenDanhMuc,
            String moTaHuongDau,
            String moTaHuongGiua,
            String moTaHuongCuoi,
            Integer idNhomHuong,
            String tenNhomHuong,
            String quocGia,
            Integer trangThai,
            Long tongSoLuongTonKho, // Hibernate may return Long for SUM
            LocalDateTime createDate,
            Long totalQuantitySold
    ) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.donGia = donGia;
        this.imageURL = imageURL;
        this.tenThuongHieu = tenThuongHieu;
        this.tenDanhMuc = tenDanhMuc;
        this.moTaHuongDau = moTaHuongDau;
        this.moTaHuongGiua = moTaHuongGiua;
        this.moTaHuongCuoi = moTaHuongCuoi;
        this.idNhomHuong = idNhomHuong;
        this.tenNhomHuong = tenNhomHuong;
        this.quocGia = quocGia;
        this.trangThai = trangThai;
        this.tongSoLuongTonKho = tongSoLuongTonKho != null ? tongSoLuongTonKho.intValue() : null;
        this.createDate = createDate;
        this.totalQuantitySold = totalQuantitySold;
    }
}