package com.example.scent.respone;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
@JsonIgnoreProperties(ignoreUnknown = true)
public class TinhThanhResponse {
    @JsonProperty("ProvinceID")  // Ánh xạ với trường "ma_tinh" trong cơ sở dữ liệu
    private int provinceID;

    @JsonProperty("ProvinceName")  // Ánh xạ với trường "ten_tinh" trong cơ sở dữ liệu
    private String provinceName;

    public int getProvinceID() {
        return provinceID;
    }

    public void setProvinceID(int provinceID) {
        this.provinceID = provinceID;
    }

    public String getProvinceName() {
        return provinceName;
    }

    public void setProvinceName(String provinceName) {
        this.provinceName = provinceName;
    }
}

