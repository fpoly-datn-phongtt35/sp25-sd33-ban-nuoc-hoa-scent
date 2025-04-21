package com.example.scent.service;

import com.example.scent.dto.MuiHuongWithStatusDTO;
import com.example.scent.entity.MuiHuong;
import com.example.scent.repo.MuiHuongInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MuiHuongService {
    @Autowired
    private MuiHuongInterface muiHuongRepository;

    public List<MuiHuong> getAll() {
        return muiHuongRepository.findAll();
    }

    public Page<MuiHuongWithStatusDTO> findAllWithStatusPaged(Pageable pageable) {
        Page<MuiHuong> muiHuongPage = muiHuongRepository.findAll(pageable);
        List<MuiHuongWithStatusDTO> dtos = muiHuongPage.getContent().stream().map(muiHuong -> {
            boolean hasProduct = muiHuongRepository.existsSanPhamByMuiHuongId(muiHuong.getId());
            return new MuiHuongWithStatusDTO(
                    muiHuong.getId(),
                    muiHuong.getTenMuiHuong(),
                    muiHuong.getMoTa(),
                    hasProduct
            );
        }).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, muiHuongPage.getTotalElements());
    }

    public MuiHuong save(MuiHuong muiHuong) {
        return muiHuongRepository.save(muiHuong);
    }

    public void deleteById(Integer id) {
        muiHuongRepository.deleteById(id);
    }
}