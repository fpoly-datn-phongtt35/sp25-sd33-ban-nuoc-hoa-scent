package com.example.scent.repo;

import com.example.scent.entity.NongDo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NongDoInterface extends JpaRepository<NongDo, Integer> {

}
