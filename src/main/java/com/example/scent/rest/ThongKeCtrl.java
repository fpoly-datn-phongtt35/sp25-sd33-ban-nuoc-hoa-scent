package com.example.scent.rest;

import com.example.scent.dto.ThongKeDTO;
import com.example.scent.service.ThongKeSv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/thongke")
public class ThongKeCtrl {
    @Autowired
    private ThongKeSv thongKeSv;

    @GetMapping("/top-customers")
    public List<ThongKeDTO> getTopCustomers() {
        return thongKeSv.findTopProductsByCustomer();
    }
}
