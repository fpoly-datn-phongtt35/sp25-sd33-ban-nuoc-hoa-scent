package com.example.scent.service;


import com.example.scent.entity.PhanHoi;
import com.example.scent.repo.PhanHoiInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhanHoiSv {
    @Autowired
    PhanHoiInterface phi;


    public List<PhanHoi> getAll() {
        return phi.findAll();
    }


    public PhanHoi add(PhanHoi phanHoi) {
        return phi.save(phanHoi);
    }


    public PhanHoi update(PhanHoi phanHoi) {
        return phi.save(phanHoi);
    }


    public void delete(Integer id) {
        phi.deleteById(id);
    }


    public PhanHoi detail(Integer id) {
        return phi.findById(id).get();
    }
}
