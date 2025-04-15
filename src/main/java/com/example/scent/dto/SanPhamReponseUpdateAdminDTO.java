package com.example.scent.dto;

import java.util.List;

public class SanPhamReponseUpdateAdminDTO {
    private Integer id;
    private String tenSanPham;
    private String moTaSanPham;
    private Integer idThuongHieu; // Added for brand
    private Integer idDanhMuc;   // Added for category
    private Integer idNhomHuong; // Added for fragrance group
    private Integer idNongDo;
    private List<MuiHuongReponseUpdateDTO> sanPhamMuiHuongs;
    private List<MuiHuongSelectionDTO> muiHuongSelections; // Added for frontend
    private TangHuongDTO huongDau;
    private TangHuongDTO huongGiua;
    private TangHuongDTO huongCuoi;
    private List<PhongCachDTO> phongCachs;
    private List<Integer> idHinhAnhs; // Added for image IDs

    // Getters and setters

    public Integer getIdNongDo() {
        return idNongDo;
    }

    public void setIdNongDo(Integer idNongDo) {
        this.idNongDo = idNongDo;
    }

    public List<MuiHuongSelectionDTO> getMuiHuongSelections() {
        return muiHuongSelections;
    }

    public void setMuiHuongSelections(List<MuiHuongSelectionDTO> muiHuongSelections) {
        this.muiHuongSelections = muiHuongSelections;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public String getMoTaSanPham() { return moTaSanPham; }
    public void setMoTaSanPham(String moTaSanPham) { this.moTaSanPham = moTaSanPham; }
    public Integer getIdThuongHieu() { return idThuongHieu; }
    public void setIdThuongHieu(Integer idThuongHieu) { this.idThuongHieu = idThuongHieu; }
    public Integer getIdDanhMuc() { return idDanhMuc; }
    public void setIdDanhMuc(Integer idDanhMuc) { this.idDanhMuc = idDanhMuc; }
    public Integer getIdNhomHuong() { return idNhomHuong; }
    public void setIdNhomHuong(Integer idNhomHuong) { this.idNhomHuong = idNhomHuong; }
    public List<MuiHuongReponseUpdateDTO> getSanPhamMuiHuongs() { return sanPhamMuiHuongs; }
    public void setSanPhamMuiHuongs(List<MuiHuongReponseUpdateDTO> sanPhamMuiHuongs) { this.sanPhamMuiHuongs = sanPhamMuiHuongs; }
    public TangHuongDTO getHuongDau() { return huongDau; }
    public void setHuongDau(TangHuongDTO huongDau) { this.huongDau = huongDau; }
    public TangHuongDTO getHuongGiua() { return huongGiua; }
    public void setHuongGiua(TangHuongDTO huongGiua) { this.huongGiua = huongGiua; }
    public TangHuongDTO getHuongCuoi() { return huongCuoi; }
    public void setHuongCuoi(TangHuongDTO huongCuoi) { this.huongCuoi = huongCuoi; }
    public List<PhongCachDTO> getPhongCachs() { return phongCachs; }
    public void setPhongCachs(List<PhongCachDTO> phongCachs) { this.phongCachs = phongCachs; }
    public List<Integer> getIdHinhAnhs() { return idHinhAnhs; }
    public void setIdHinhAnhs(List<Integer> idHinhAnhs) { this.idHinhAnhs = idHinhAnhs; }
}