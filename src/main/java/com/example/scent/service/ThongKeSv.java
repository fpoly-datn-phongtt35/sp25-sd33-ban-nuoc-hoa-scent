package com.example.scent.service;

import com.example.scent.repo.DonHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ThongKeSv {
    @Autowired
    private DonHangInterface donHangRepo;

    public List<Object[]> findTopProductsByCustomer() {
        return donHangRepo.findTopProductsByCustomer();
    }
}
