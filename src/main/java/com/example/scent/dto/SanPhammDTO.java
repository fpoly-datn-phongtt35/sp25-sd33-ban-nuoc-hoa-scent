package com.example.scent.dto;



import java.util.List;

public class SanPhammDTO {
    private Integer idSanPham;
    private String tenSanPham;
    private String imageURL;
    private String tenThuongHieu;
    private String tenDanhMuc;
    private String tenNhomHuong;
    private Long tongSoLuong;
    private List<NotHuongDTO> huongDau; // Danh sách nốt hương đầu
    private List<NotHuongDTO> huongGiua; // Danh sách nốt hương giữa
    private List<NotHuongDTO> huongCuoi; // Danh sách nốt hương cuối
    private List<PhongCachDTO> phongCach; // Danh sách phong cách
    private List<MuiHuongSelectionDTO> muiHuongSelections; // Danh sách mùi hương và độ nổi hương
    private Integer trangThai;
    public SanPhammDTO() {
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public SanPhammDTO(Integer idSanPham, String tenSanPham, String imageURL, String tenThuongHieu, String tenDanhMuc, String tenNhomHuong, Long tongSoLuong, List<NotHuongDTO> huongDau, List<NotHuongDTO> huongGiua, List<NotHuongDTO> huongCuoi, List<PhongCachDTO> phongCach, List<MuiHuongSelectionDTO> muiHuongSelections, Integer trangThai) {
        this.idSanPham = idSanPham;
        this.tenSanPham = tenSanPham;
        this.imageURL = imageURL;
        this.tenThuongHieu = tenThuongHieu;
        this.tenDanhMuc = tenDanhMuc;
        this.tenNhomHuong = tenNhomHuong;
        this.tongSoLuong = tongSoLuong;
        this.huongDau = huongDau;
        this.huongGiua = huongGiua;
        this.huongCuoi = huongCuoi;
        this.phongCach = phongCach;
        this.muiHuongSelections = muiHuongSelections;
        this.trangThai = trangThai;
    }

    // Getters và Setters
    public Integer getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        this.idSanPham = idSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public String getTenDanhMuc() {
        return tenDanhMuc;
    }

    public void setTenDanhMuc(String tenDanhMuc) {
        this.tenDanhMuc = tenDanhMuc;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public Long getTongSoLuong() {
        return tongSoLuong;
    }

    public void setTongSoLuong(Long tongSoLuong) {
        this.tongSoLuong = tongSoLuong;
    }

    public List<NotHuongDTO> getHuongDau() {
        return huongDau;
    }

    public void setHuongDau(List<NotHuongDTO> huongDau) {
        this.huongDau = huongDau;
    }

    public List<NotHuongDTO> getHuongGiua() {
        return huongGiua;
    }

    public void setHuongGiua(List<NotHuongDTO> huongGiua) {
        this.huongGiua = huongGiua;
    }

    public List<NotHuongDTO> getHuongCuoi() {
        return huongCuoi;
    }

    public void setHuongCuoi(List<NotHuongDTO> huongCuoi) {
        this.huongCuoi = huongCuoi;
    }

    public List<PhongCachDTO> getPhongCach() {
        return phongCach;
    }

    public void setPhongCach(List<PhongCachDTO> phongCach) {
        this.phongCach = phongCach;
    }

    public List<MuiHuongSelectionDTO> getMuiHuongSelections() {
        return muiHuongSelections;
    }

    public void setMuiHuongSelections(List<MuiHuongSelectionDTO> muiHuongSelections) {
        this.muiHuongSelections = muiHuongSelections;
    }

}
