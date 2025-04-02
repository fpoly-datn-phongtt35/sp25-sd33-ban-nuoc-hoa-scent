package com.example.scent.dto;

import java.math.BigDecimal;

public class SanPhamOnHomeRequestDTO {
    private String searchQuery;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String tenDanhMuc;
    private String tenNhomHuong;
    private String tenThuongHieu;
    private String quocGia;
    private int page; // Để thay thế cho Pageable
    private int size; // Để thay thế cho Pageable

    public SanPhamOnHomeRequestDTO(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public SanPhamOnHomeRequestDTO(int size, int page, String quocGia, String tenThuongHieu, String tenNhomHuong, String tenDanhMuc, BigDecimal maxPrice, BigDecimal minPrice, String searchQuery) {
        this.size = size;
        this.page = page;
        this.quocGia = quocGia;
        this.tenThuongHieu = tenThuongHieu;
        this.tenNhomHuong = tenNhomHuong;
        this.tenDanhMuc = tenDanhMuc;
        this.maxPrice = maxPrice;
        this.minPrice = minPrice;
        this.searchQuery = searchQuery;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public String getTenNhomHuong() {
        return tenNhomHuong;
    }

    public void setTenNhomHuong(String tenNhomHuong) {
        this.tenNhomHuong = tenNhomHuong;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }

    public String getTenDanhMuc() {
        return tenDanhMuc;
    }

    public void setTenDanhMuc(String tenDanhMuc) {
        this.tenDanhMuc = tenDanhMuc;
    }

    public String getTenThuongHieu() {
        return tenThuongHieu;
    }

    public void setTenThuongHieu(String tenThuongHieu) {
        this.tenThuongHieu = tenThuongHieu;
    }

    public String getQuocGia() {
        return quocGia;
    }

    public void setQuocGia(String quocGia) {
        this.quocGia = quocGia;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }


}
