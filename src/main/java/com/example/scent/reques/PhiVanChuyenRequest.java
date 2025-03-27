package com.example.scent.reques;

import com.example.scent.service.Constant;

public class PhiVanChuyenRequest {

    private int from_district_id;  // ID của quận huyện gửi
    private String to_ward_code;   // Mã phường xã nhận
    private int weight;            // Trọng lượng của kiện hàng (gram)
    private int length;            // Chiều dài (cm)
    private int width;             // Chiều rộng (cm)
    private int height;            // Chiều cao (cm)
    private Integer idMaTinh;
    private Integer idQuanHuyen;  // ID Quận Huyện nhận
    private String idPhuongXa;    // Mã Phường Xã nhận
    private Integer soLuongSanPham;  // Số lượng sản phẩm
    private Integer trungBinhCacCanh; // field declaration

    public Integer getIdMaTinh() {
        return idMaTinh;
    }

    public void setIdMaTinh(Integer idMaTinh) {
        this.idMaTinh = idMaTinh;
    }

    // Getter và Setter
    public void setStringPhuongXa(String phuongXa) {
        this.idPhuongXa = phuongXa; // Sets the phuong xa directly
    }

    public String getStringPhuongXa(){
        return this.idPhuongXa; // Lấy mã phường xã trực tiếp từ idPhuongXa
    }

    // Tính toán chiều dài trung bình của các sản phẩm
    public Integer getTrungBinhCacCanh (){
        Double theTichToanBoSanPham = Math.pow(Constant.DO_DAI_CANH_HOP_HANG,3) * this.soLuongSanPham;
        return (int) Math.cbrt(theTichToanBoSanPham);
    }

    public int getFrom_district_id() {
        return from_district_id;
    }

    public void setFrom_district_id(int from_district_id) {
        this.from_district_id = from_district_id;
    }

    public String getTo_ward_code() {
        return to_ward_code;
    }

    public void setTo_ward_code(String to_ward_code) {
        this.to_ward_code = to_ward_code;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public Integer getIdQuanHuyen() {
        return idQuanHuyen;
    }

    public void setIdQuanHuyen(Integer idQuanHuyen) {
        this.idQuanHuyen = idQuanHuyen;
    }

    public String getIdPhuongXa() {
        return idPhuongXa;
    }

    public void setIdPhuongXa(String idPhuongXa) {
        this.idPhuongXa = idPhuongXa;
    }

    public Integer getSoLuongSanPham() {
        return soLuongSanPham;
    }
    public void setTrungBinhCacCanh(Integer trungBinhCacCanh) {
        this.trungBinhCacCanh = trungBinhCacCanh;
    }

    public void setSoLuongSanPham(Integer soLuongSanPham) {
        this.soLuongSanPham = soLuongSanPham;
    }
}
