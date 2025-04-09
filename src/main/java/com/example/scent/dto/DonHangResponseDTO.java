package com.example.scent.dto;

import com.example.scent.entity.DonHang;

public class DonHangResponseDTO {
    private Integer idDonHang;
    private String tenNguoiNhanHang;
    private String sdtNguoiNhan;
    private Integer maTinh;
    private Integer maQuan;
    private String maPhuong;
    private String diaChiGiaoHang; // Địa chỉ đầy đủ
    private String diaChiChiTiet; // Địa chỉ chi tiết (sẽ tách ra)

    // Getters và Setters
    public Integer getIdDonHang() {
        return idDonHang;
    }

    public void setIdDonHang(Integer idDonHang) {
        this.idDonHang = idDonHang;
    }

    public String getTenNguoiNhanHang() {
        return tenNguoiNhanHang;
    }

    public void setTenNguoiNhanHang(String tenNguoiNhanHang) {
        this.tenNguoiNhanHang = tenNguoiNhanHang;
    }

    public String getSdtNguoiNhan() {
        return sdtNguoiNhan;
    }

    public void setSdtNguoiNhan(String sdtNguoiNhan) {
        this.sdtNguoiNhan = sdtNguoiNhan;
    }

    public Integer getMaTinh() {
        return maTinh;
    }

    public void setMaTinh(Integer maTinh) {
        this.maTinh = maTinh;
    }

    public Integer getMaQuan() {
        return maQuan;
    }

    public void setMaQuan(Integer maQuan) {
        this.maQuan = maQuan;
    }

    public String getMaPhuong() {
        return maPhuong;
    }

    public void setMaPhuong(String maPhuong) {
        this.maPhuong = maPhuong;
    }

    public String getDiaChiGiaoHang() {
        return diaChiGiaoHang;
    }

    public void setDiaChiGiaoHang(String diaChiGiaoHang) {
        this.diaChiGiaoHang = diaChiGiaoHang;
    }

    public String getDiaChiChiTiet() {
        return diaChiChiTiet;
    }

    public void setDiaChiChiTiet(String diaChiChiTiet) {
        this.diaChiChiTiet = diaChiChiTiet;
    }

    public static DonHangResponseDTO fromEntity(DonHang donHang) throws Exception {
        DonHangResponseDTO dto = new DonHangResponseDTO();
        dto.setIdDonHang(donHang.getId());
        dto.setTenNguoiNhanHang(donHang.getTenNguoiNhanHang());
        dto.setSdtNguoiNhan(donHang.getSdtNguoiNhan());
        dto.setMaTinh(donHang.getMaTinh());
        dto.setMaQuan(donHang.getMaQuan());
        dto.setMaPhuong(donHang.getMaPhuong());
        dto.setDiaChiGiaoHang(donHang.getDiaChiGiaoHang());

        // Tách địa chỉ chi tiết từ diaChiGiaoHang
        // diaChiGiaoHang có dạng: "Thôn 4, Phường An Lợi Đông, Quận 2, Hồ Chí Minh"
        String diaChiGiaoHang = donHang.getDiaChiGiaoHang();
        if (diaChiGiaoHang != null && !diaChiGiaoHang.isEmpty()) {
            String[] parts = diaChiGiaoHang.split(", ");
            if (parts.length > 0) {
                dto.setDiaChiChiTiet(parts[0]); // Phần đầu tiên là địa chỉ chi tiết (ví dụ: "Thôn 4")
            } else {
                dto.setDiaChiChiTiet("");
            }
        } else {
            dto.setDiaChiChiTiet("");
        }

        return dto;
    }
}
