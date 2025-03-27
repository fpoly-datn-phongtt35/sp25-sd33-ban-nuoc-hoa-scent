package com.example.scent.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "phuong")
@Entity
@Getter
@Setter
public class Phuong {
    @Id
    @Column(name = "ma_phuong")
    private String maPhuong;

    @ManyToOne
    @JoinColumn(name = "ma_quan")
    private quan quan; // Liên kết với bảng Quan

    @Column(name = "ten_phuong")
    private String tenPhuong;
    @Version
    @Column(name = "version")
    private Long version = 0L;
}
