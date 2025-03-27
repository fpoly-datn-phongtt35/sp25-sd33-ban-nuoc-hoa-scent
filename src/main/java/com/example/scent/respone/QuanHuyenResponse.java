package com.example.scent.respone;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class QuanHuyenResponse {
    @JsonProperty("DistrictID")  // Ánh xạ với trường "ma_quan" trong cơ sở dữ liệu
    private Integer maQuan;

    @JsonProperty("DistrictName")  // Ánh xạ với trường "ten_quan" trong cơ sở dữ liệu
    private String tenQuan;

    // Getters và Setters
    public Integer getMaQuan() {
        return maQuan;
    }

    public void setMaQuan(Integer maQuan) {
        this.maQuan = maQuan;
    }

    public String getTenQuan() {
        return tenQuan;
    }

    public void setTenQuan(String tenQuan) {
        this.tenQuan = tenQuan;
    }
}

