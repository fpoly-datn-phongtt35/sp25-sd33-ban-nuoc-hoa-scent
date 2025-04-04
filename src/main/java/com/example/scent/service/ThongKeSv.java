package com.example.scent.service;

import com.example.scent.dto.ThongKeDTO;
import com.example.scent.repo.DonHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThongKeSv {
    @Autowired
    private DonHangInterface donHangRepo;

    public List<ThongKeDTO> findTopProductsByCustomer() {
        List<Object[]> rawData = donHangRepo.findTopProductsByCustomer();
        if (rawData == null || rawData.isEmpty()) {
            return List.of();  // Trả về danh sách rỗng thay vì null
        }
        return rawData.stream()
                .map(obj -> new ThongKeDTO(
                        (String) obj[0],  // Tên khách hàng
                        (String) obj[1],  // Tên sản phẩm
                        ((Number) obj[2]).longValue()  // Số lượng mua
                ))
                .collect(Collectors.toList());
    }
}
