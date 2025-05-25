package com.example.scent.service;

import com.example.scent.dto.NotHuongRequestDTO;
import com.example.scent.dto.NotHuongWithStatusDTO;
import com.example.scent.entity.MuiHuong;
import com.example.scent.entity.NotHuong;
import com.example.scent.repo.MuiHuongInterface;
import com.example.scent.repo.NotHuongInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotHuongService {
    @Autowired
    private NotHuongInterface notHuongRepository;
    @Autowired
    private MuiHuongInterface muiHuongRepository;
    public List<NotHuong> getAll() {
        return notHuongRepository.findAll();
    }

    public Page<NotHuongWithStatusDTO> findAllWithStatusPaged(Pageable pageable) {
        Page<NotHuong> notHuongPage = notHuongRepository.findAll(pageable);
        List<NotHuongWithStatusDTO> dtos = notHuongPage.getContent().stream().map(notHuong -> {
            boolean hasProduct = notHuongRepository.existsSanPhamByNotHuongId(notHuong.getId());
            return new NotHuongWithStatusDTO(
                    notHuong.getId(),
                    notHuong.getTenNotHuong(),
                    notHuong.getMoTa(),
                    notHuong.getMuiHuong() != null ? notHuong.getMuiHuong().getId() : null,
                    notHuong.getMuiHuong() != null ? notHuong.getMuiHuong().getTenMuiHuong() : null,
                    hasProduct
            );
        }).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, notHuongPage.getTotalElements());
    }

    public NotHuong save(NotHuongRequestDTO notHuongDTO) {
        NotHuong notHuong = new NotHuong();
        notHuong.setId(notHuongDTO.getId());
        notHuong.setTenNotHuong(notHuongDTO.getTenNotHuong());
        notHuong.setMoTa(notHuongDTO.getMoTa());
        if (notHuongDTO.getIdmuiHuong() != null) {
            MuiHuong muiHuong = muiHuongRepository.findById(notHuongDTO.getIdmuiHuong())
                    .orElseThrow(() -> new RuntimeException("MuiHuong not found with id: " + notHuongDTO.getIdmuiHuong()));
            notHuong.setMuiHuong(muiHuong);
        }
        return notHuongRepository.save(notHuong);
    }

    public void deleteById(Integer id) {
        notHuongRepository.deleteById(id);
    }
}