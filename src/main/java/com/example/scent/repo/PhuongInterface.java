package com.example.scent.repo;

import com.example.scent.entity.Phuong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhuongInterface extends JpaRepository<Phuong,Integer>{
        Optional<Phuong> findByMaPhuong(String maPhuong);
        }
