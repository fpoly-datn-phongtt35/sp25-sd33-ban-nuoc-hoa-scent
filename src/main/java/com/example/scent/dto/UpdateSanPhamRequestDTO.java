package com.example.scent.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class UpdateSanPhamRequestDTO {
    private Integer idSanPham;
    private String ten;
    private String moTa;
    private Integer idThuongHieu;
    private Integer idDanhMuc;
    private Integer idNhomHuong;
    private List<MuiHuongSelectionDTO> muiHuongSelections;
    private List<Integer> notHuongDauIds;
    private List<Integer> notHuongGiuaIds;
    private List<Integer> notHuongCuoiIds;
    private List<Integer> phongCachIds;
    private MultipartFile[] images;
    private Integer[] idHinhAnhDelete;

    // Getters và setters
    public Integer getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(Integer idSanPham) {
        this.idSanPham = idSanPham;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Integer getIdThuongHieu() {
        return idThuongHieu;
    }

    public void setIdThuongHieu(Integer idThuongHieu) {
        this.idThuongHieu = idThuongHieu;
    }

    public Integer getIdDanhMuc() {
        return idDanhMuc;
    }

    public void setIdDanhMuc(Integer idDanhMuc) {
        this.idDanhMuc = idDanhMuc;
    }

    public Integer getIdNhomHuong() {
        return idNhomHuong;
    }

    public void setIdNhomHuong(Integer idNhomHuong) {
        this.idNhomHuong = idNhomHuong;
    }

    public List<MuiHuongSelectionDTO> getMuiHuongSelections() {
        return muiHuongSelections;
    }

    public void setMuiHuongSelections(List<MuiHuongSelectionDTO> muiHuongSelections) {
        this.muiHuongSelections = muiHuongSelections;
    }

    public List<Integer> getNotHuongDauIds() {
        return notHuongDauIds;
    }

    public void setNotHuongDauIds(List<Integer> notHuongDauIds) {
        this.notHuongDauIds = notHuongDauIds;
    }

    public List<Integer> getNotHuongGiuaIds() {
        return notHuongGiuaIds;
    }

    public void setNotHuongGiuaIds(List<Integer> notHuongGiuaIds) {
        this.notHuongGiuaIds = notHuongGiuaIds;
    }

    public List<Integer> getNotHuongCuoiIds() {
        return notHuongCuoiIds;
    }

    public void setNotHuongCuoiIds(List<Integer> notHuongCuoiIds) {
        this.notHuongCuoiIds = notHuongCuoiIds;
    }

    public List<Integer> getPhongCachIds() {
        return phongCachIds;
    }

    public void setPhongCachIds(List<Integer> phongCachIds) {
        this.phongCachIds = phongCachIds;
    }

    public MultipartFile[] getImages() {
        return images;
    }

    public void setImages(MultipartFile[] images) {
        this.images = images;
    }

    public Integer[] getIdHinhAnhDelete() {
        return idHinhAnhDelete;
    }

    public void setIdHinhAnhDelete(Integer[] idHinhAnhDelete) {
        this.idHinhAnhDelete = idHinhAnhDelete;
    }
}