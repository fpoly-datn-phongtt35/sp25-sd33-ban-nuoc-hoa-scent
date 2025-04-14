package com.example.scent.websocket;

import java.math.BigDecimal;

public class SpctMessage {

        private Integer idSpct;
        private Integer trangThai;
        private Integer dungTich;
        private BigDecimal donGia;

    public Integer getDungTich() {
        return dungTich;
    }

    public void setDungTich(Integer dungTich) {
        this.dungTich = dungTich;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    // Getters and setters
        public Integer getIdSpct() {
            return idSpct;
        }

        public void setIdSpct(Integer id) {
            this.idSpct = id;
        }

        public Integer getTrangThai() {
            return trangThai;
        }

        public void setTrangThai(Integer trangThai) {
            this.trangThai = trangThai;
        }

}
