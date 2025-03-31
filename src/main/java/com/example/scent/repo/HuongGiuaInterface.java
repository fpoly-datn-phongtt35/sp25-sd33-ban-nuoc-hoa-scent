package com.example.scent.repo;

import com.example.scent.entity.HuongGiua;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface HuongGiuaInterface extends JpaRepository<HuongGiua, Integer>{
    void removeById(Integer id);
}
