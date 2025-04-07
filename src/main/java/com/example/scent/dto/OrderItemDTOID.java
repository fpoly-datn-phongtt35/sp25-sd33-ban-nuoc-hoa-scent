package com.example.scent.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;


    @Getter
    @Setter

    public class OrderItemDTOID {
        private Integer spctId;  // ID của sản phẩm cụ thể
        private Integer quantity;  // Số lượng đặt mua
        private List<String> imageURL;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
        private String tenSanPham;
private BigDecimal soTienGiamGia;
        private Integer idSanPham;
        public BigDecimal getSoTienGiamGia() {
            return soTienGiamGia;
        }

        public void setSoTienGiamGia(BigDecimal soTienGiamGia) {
            this.soTienGiamGia = soTienGiamGia;
        }

        public String getTenSanPham() {
            return tenSanPham;
        }

        public void setTenSanPham(String tenSanPham) {
            this.tenSanPham = tenSanPham;
        }

        public Integer getIdSanPham() {
            return idSanPham;
        }

        public OrderItemDTOID(Integer spctId, Integer quantity, List<String> imageURL, BigDecimal donGia, BigDecimal thanhTien, String tenSanPham, BigDecimal soTienGiamGia, Integer idSanPham) {
            this.spctId = spctId;
            this.quantity = quantity;
            this.imageURL = imageURL;
            this.donGia = donGia;
            this.thanhTien = thanhTien;
            this.tenSanPham = tenSanPham;
            this.soTienGiamGia = soTienGiamGia;
            this.idSanPham = idSanPham;
        }

        public void setIdSanPham(Integer idSanPham) {
            this.idSanPham = idSanPham;
        }

        public OrderItemDTOID() {
        }

        public Integer getSpctId() {
            return spctId;
        }

        public void setSpctId(Integer spctId) {
            this.spctId = spctId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public List<String> getImageURL() {
            return imageURL;
        }

        public void setImageURL(List<String> imageURL) {
            this.imageURL = imageURL;
        }

        public BigDecimal getDonGia() {
            return donGia;
        }

        public void setDonGia(BigDecimal donGia) {
            this.donGia = donGia;
        }

        public BigDecimal getThanhTien() {
            return thanhTien;
        }

        public void setThanhTien(BigDecimal thanhTien) {
            this.thanhTien = thanhTien;
        }
    }
