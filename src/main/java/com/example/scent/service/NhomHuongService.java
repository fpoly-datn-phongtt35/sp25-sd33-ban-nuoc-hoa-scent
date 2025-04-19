package com.example.scent.service;

import com.example.scent.entity.NhomHuong;
import com.example.scent.repo.NhomHuongInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhomHuongService {
    @Autowired
    private NhomHuongInterface nhomHuongRepo;

    public List<NhomHuong> findAll() {
        return nhomHuongRepo.findAll();
    }

    public Optional<NhomHuong> findById(Integer id) {
        return nhomHuongRepo.findById(id);
    }

    public NhomHuong save(NhomHuong nhomHuong) {
        return nhomHuongRepo.save(nhomHuong);
    }

    public void deleteById(Integer id) {
        nhomHuongRepo.deleteById(id);
    }

    public Page<NhomHuong> findAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return nhomHuongRepo.findAll(pageable);
    }
}
