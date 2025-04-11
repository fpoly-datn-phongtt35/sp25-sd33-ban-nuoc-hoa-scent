package com.example.scent.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(as = MuiHuongDtoImpl.class)
public interface MuiHuongDto {
    String getTenMuiHuong();
    Float getProminence();
}