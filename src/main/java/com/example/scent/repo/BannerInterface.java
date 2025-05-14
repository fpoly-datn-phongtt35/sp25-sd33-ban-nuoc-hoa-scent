package com.example.scent.repo;

import com.example.scent.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerInterface extends JpaRepository<Banner,Long> {
    List<Banner> findByIsActive(int isActive);
}
