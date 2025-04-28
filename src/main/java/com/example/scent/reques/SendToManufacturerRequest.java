package com.example.scent.reques;



import lombok.Data;

@Data
public class SendToManufacturerRequest {
    private Integer idYeuCau;
    private Integer idSpct;
    private Integer soLuongGui;
    private Integer idThuongHieu;
    private String ghiChu;
}
