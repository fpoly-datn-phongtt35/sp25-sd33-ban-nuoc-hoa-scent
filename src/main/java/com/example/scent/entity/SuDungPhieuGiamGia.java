package com.example.scent.entity;



import jakarta.persistence.*;
import lombok.Data;


import java.util.Date;

@Entity
@Table(name = "su_dung_phieu_giam_gia")
@Data
public class SuDungPhieuGiamGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "pgg_id", nullable = false)
    private Integer phieuGiamGiaId;

    @Column(name = "sdt", nullable = false)
    private String sdt;

    @Column(name = "ngay_su_dung", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date ngaySuDung;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getPhieuGiamGiaId() {
        return phieuGiamGiaId;
    }

    public void setPhieuGiamGiaId(Integer phieuGiamGiaId) {
        this.phieuGiamGiaId = phieuGiamGiaId;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public Date getNgaySuDung() {
        return ngaySuDung;
    }

    public void setNgaySuDung(Date ngaySuDung) {
        this.ngaySuDung = ngaySuDung;
    }
}
