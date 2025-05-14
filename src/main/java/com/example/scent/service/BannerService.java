package com.example.scent.service;

import com.example.scent.entity.Banner;
import com.example.scent.repo.BannerInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BannerService {

    @Autowired
    private BannerInterface bannerRepository;

    public Banner toggleBannerStatus(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        banner.setIsActive(banner.getIsActive() == 1 ? 0 : 1); // Chuyển đổi giữa 0 và 1
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActive(1); // Lấy các banner có is_active = 1
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    public Banner createBanner(Banner banner) {
        banner.setCreatedAt(LocalDateTime.now());
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner banner = getBannerById(id);
        banner.setTitle(bannerDetails.getTitle());
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setLinkUrl(bannerDetails.getLinkUrl());
        banner.setPosition(bannerDetails.getPosition());
        banner.setIsActive(bannerDetails.getIsActive());
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        Banner banner = getBannerById(id);
        bannerRepository.delete(banner);
    }
}