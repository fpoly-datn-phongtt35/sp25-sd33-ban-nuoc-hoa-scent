package com.example.scent.repo;

import com.example.scent.entity.NhomHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    public interface NhomHuongInterface extends JpaRepository<NhomHuong, Integer> {

    }
