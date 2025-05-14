package com.example.scent.rest;

import com.example.scent.entity.Banner;
import com.example.scent.service.BannerService;
import com.example.scent.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "http://localhost:4200")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> activeBanners = bannerService.getActiveBanners();
        return ResponseEntity.ok(activeBanners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        Banner banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(banner);
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "isActive", defaultValue = "1") int isActive) throws IOException {
        String imageUrl = fileStorageService.storeFile(file);

        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setImageUrl(imageUrl);
        banner.setLinkUrl(linkUrl);
        banner.setPosition(position);
        banner.setIsActive(isActive);

        Banner createdBanner = bannerService.createBanner(banner);
        return ResponseEntity.ok(createdBanner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "isActive", defaultValue = "1") int isActive) throws IOException {
        Banner bannerDetails = new Banner();
        bannerDetails.setTitle(title);
        if (file != null && !file.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(file);
            bannerDetails.setImageUrl(imageUrl);
        } else {
            Banner existingBanner = bannerService.getBannerById(id);
            bannerDetails.setImageUrl(existingBanner.getImageUrl());
        }
        bannerDetails.setLinkUrl(linkUrl);
        bannerDetails.setPosition(position);
        bannerDetails.setIsActive(isActive);

        Banner updatedBanner = bannerService.updateBanner(id, bannerDetails);
        return ResponseEntity.ok(updatedBanner);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Banner> toggleBannerStatus(@PathVariable Long id) {
        Banner updatedBanner = bannerService.toggleBannerStatus(id);
        return ResponseEntity.ok(updatedBanner);
    }
}