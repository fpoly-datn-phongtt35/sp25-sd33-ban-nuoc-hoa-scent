package com.example.scent.respone;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data

public class PhiVanChuyenResponse {
    @JsonProperty("total")
    private Integer total;

    // Constructor mặc định
    public PhiVanChuyenResponse() {
    }

    // Constructor có tham số
    public PhiVanChuyenResponse(Integer total) {
        this.total = total;
    }

    // Getter và Setter (nếu cần)
    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }
}

