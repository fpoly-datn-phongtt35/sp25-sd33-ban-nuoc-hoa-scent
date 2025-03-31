package com.example.scent.repo;

import com.example.scent.entity.HuongCuoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface HuongCuoiInterface extends JpaRepository<HuongCuoi, Integer>{
    void removeById(Integer id);
}
