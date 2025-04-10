package com.example.scent.dto;

public class MuiHuongSelectionDTO {
    private Integer id;
    private Float prominence;

    // Getters, setters, and constructors
    public MuiHuongSelectionDTO() {}
    public MuiHuongSelectionDTO(Integer id, Float prominence) {
        this.id = id;
        this.prominence = prominence;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Float getProminence() { return prominence; }
    public void setProminence(Float prominence) { this.prominence = prominence; }
}
