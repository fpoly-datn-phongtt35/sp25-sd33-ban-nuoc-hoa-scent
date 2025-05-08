package com.example.scent.rest;

import com.example.scent.dto.BestSellingSanPhamInfoDTO;
import com.example.scent.entity.ThongKe.BestSellingProductDTO;
import com.example.scent.entity.ThongKe.SoLuongDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeTheoThoiGianDTO;
import com.example.scent.repo.CTDHInterface;
import com.example.scent.repo.SanPhamInterface;
import com.example.scent.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/thong-ke")
public class ThongKeController {
    @Autowired
    SanPhamInterface sanPhamInterface;
@Autowired
    CTDHInterface ctdhInterface;
    @Autowired
    private ThongKeService thongKeService;
    @GetMapping("/top-san-pham")
    public List<BestSellingSanPhamInfoDTO> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int topN) {
        return ctdhInterface.findTopSellingProducts()
                .stream()
                .limit(topN)
                .collect(Collectors.toList());
    }

    @GetMapping("/tong-quan")
    public ThongKeDonHangDTO thongKeTongQuan() {
        return thongKeService.thongKeTongQuan();
    }

    // Endpoint for aggregated statistics by date range (Theo ngày)
    @GetMapping("/tong-quan/ngay")
    public ThongKeDonHangDTO thongKeTongQuanTheoNgay(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return thongKeService.thongKeTongQuanTheoNgay(startDate, endDate);
    }

    // Endpoint for aggregated statistics by week (Theo tuần)
    @GetMapping("/tong-quan/tuan")
    public ThongKeDonHangDTO thongKeTongQuanTheoTuan(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week) {
        return thongKeService.thongKeTongQuanTheoTuan(year, week);
    }

    // Endpoint for aggregated statistics by month (Theo tháng)
    @GetMapping("/tong-quan/thang")
    public ThongKeDonHangDTO thongKeTongQuanTheoThang(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        return thongKeService.thongKeTongQuanTheoThang(year, month);
    }

    // Endpoint for aggregated statistics by year (Theo năm)
    @GetMapping("/tong-quan/nam")
    public ThongKeDonHangDTO thongKeTongQuanTheoNam(
            @RequestParam(value = "year", required = false) Integer year) {
        return thongKeService.thongKeTongQuanTheoNam(year);
    }

    // Existing endpoints for chart data
    @GetMapping("/doanh-thu/ngay")
    public List<ThongKeTheoThoiGianDTO> thongKeTheoNgay(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return thongKeService.thongKeTheoNgay(startDate, endDate);
    }

    @GetMapping("/doanh-thu/tuan")
    public List<ThongKeTheoThoiGianDTO> thongKeTheoTuan(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week) {
        return thongKeService.thongKeTheoTuan(year, week);
    }

    @GetMapping("/doanh-thu/thang")
    public List<ThongKeTheoThoiGianDTO> thongKeTheoThang(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        return thongKeService.thongKeTheoThang(year, month);
    }

    @GetMapping("/doanh-thu/nam")
    public List<ThongKeTheoThoiGianDTO> thongKeTheoNam(
            @RequestParam(value = "year", required = false) Integer year) {
        return thongKeService.thongKeTheoNam(year);
    }

    @GetMapping("/so-luong-don/ngay")
    public List<SoLuongDonHangDTO> getSoLuongDonTheoNgay(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        return thongKeService.getSoLuongDonTheoNgay(startDate, endDate);
    }

    @GetMapping("/so-luong-don/tuan")
    public List<SoLuongDonHangDTO> getSoLuongDonTheoTuan(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week) {
        return thongKeService.getSoLuongDonTheoTuan(year, week);
    }

    @GetMapping("/so-luong-don/thang")
    public List<SoLuongDonHangDTO> getSoLuongDonTheoThang(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        return thongKeService.getSoLuongDonTheoThang(year, month);
    }

    @GetMapping("/so-luong-don/nam")
    public List<SoLuongDonHangDTO> getSoLuongDonTheoNam(
            @RequestParam(value = "year", required = false) Integer year) {
        return thongKeService.getSoLuongDonTheoNam(year);
    }


    //===========sản phẩm====================
    @GetMapping("/best-selling/ngay")
    public Page<BestSellingProductDTO> getBestSellingProductsByDateRange(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return thongKeService.getBestSellingProductsByDateRange(startDate, endDate, pageable);
    }

    // Best-selling products by week with pagination
    @GetMapping("/best-selling/tuan")
    public Page<BestSellingProductDTO> getBestSellingProductsByWeek(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return thongKeService.getBestSellingProductsByWeek(year, week, pageable);
    }

    // Best-selling products by month with pagination
    @GetMapping("/best-selling/thang")
    public Page<BestSellingProductDTO> getBestSellingProductsByMonth(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return thongKeService.getBestSellingProductsByMonth(year, month, pageable);
    }

    // Best-selling products by year with pagination
    @GetMapping("/best-selling/nam")
    public Page<BestSellingProductDTO> getBestSellingProductsByYear(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return thongKeService.getBestSellingProductsByYear(year, pageable);
    }
}