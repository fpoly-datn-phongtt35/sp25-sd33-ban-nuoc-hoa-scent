package com.example.scent.respone;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PhuongXaResponse {
    @JsonProperty("WardCode")  // Ánh xạ với trường "WardCode" trong JSON
    private String maPhuong;

    @JsonProperty("WardName")  // Ánh xạ với trường "WardName" trong JSON
    private String tenPhuong;
    @JsonProperty("NameExtension")
    private String[] nameExtension;

    public String getMaPhuong() {
        return maPhuong;
    }

    public void setMaPhuong(String maPhuong) {
        this.maPhuong = maPhuong;
    }

    public String getTenPhuong() {
        return tenPhuong;
    }

    public void setTenPhuong(String tenPhuong) {
        this.tenPhuong = tenPhuong;
    }

    public String[] getNameExtension() {
        return nameExtension;
    }

    public void setNameExtension(String[] nameExtension) {
        this.nameExtension = nameExtension;
    }
}

