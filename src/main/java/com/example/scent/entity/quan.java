package com.example.scent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "quan")
@Entity
public class quan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_quan")
    private Integer maQuan;

    @ManyToOne
    @JoinColumn(name = "ma_tinh")
    private tinh tinh; // Liên kết với bảng Tinh
    @Version
    @Column(name = "version")
    private Long version = 0L;
    @Column(name = "ten_quan")
    private String tenQuan;
}
