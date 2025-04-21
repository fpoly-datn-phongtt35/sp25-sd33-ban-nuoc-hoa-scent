package com.example.scent.service;

import com.example.scent.dto.PhongCachWithStatusDTO;
import com.example.scent.entity.PhongCach;
import com.example.scent.repo.PhongCachInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhongCachService {
    @Autowired
    private PhongCachInterface phongCachRepository;

    public List<PhongCach> getAll() {
        return phongCachRepository.findAll();
    }

    public Page<PhongCachWithStatusDTO> findAllWithStatusPaged(Pageable pageable) {
        Page<PhongCach> phongCachPage = phongCachRepository.findAll(pageable);
        List<PhongCachWithStatusDTO> dtos = phongCachPage.getContent().stream().map(phongCach -> {
            boolean hasProduct = phongCachRepository.existsSanPhamByPhongCachId(phongCach.getId());
            return new PhongCachWithStatusDTO(
                    phongCach.getId(),
                    phongCach.getTenPhongCach(),
                    phongCach.getMoTa(),
                    hasProduct
            );
        }).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, phongCachPage.getTotalElements());
    }

    public PhongCach save(PhongCach phongCach) {
        return phongCachRepository.save(phongCach);
    }

    public void deleteById(Integer id) {
        phongCachRepository.deleteById(id);
    }
}