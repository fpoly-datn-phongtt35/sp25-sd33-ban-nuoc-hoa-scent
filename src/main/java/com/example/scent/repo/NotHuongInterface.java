package com.example.scent.repo;

import com.example.scent.entity.NotHuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotHuongInterface extends JpaRepository<NotHuong, Integer> {
}
