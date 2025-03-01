package com.example.scent.service;

import com.example.scent.entity.DanhGiaDichVu;
import com.example.scent.repo.DanhGiaDichVuInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DanhGiaDichVuSv {

    @Autowired
    DanhGiaDichVuInterface danhGiaDichVuI;

    public List<DanhGiaDichVu> getAll() {
        return danhGiaDichVuI.findAll();
    }

    public DanhGiaDichVu add(DanhGiaDichVu dgdv) {
        return danhGiaDichVuI.save(dgdv);
    }

    public DanhGiaDichVu update(DanhGiaDichVu dgdv) {
        return danhGiaDichVuI.save(dgdv);
    }

    public void delete(Integer id) {
        danhGiaDichVuI.deleteById(id);
    }

    public DanhGiaDichVu detail(Integer id) {
        return danhGiaDichVuI.findById(id).get();
    }



}
