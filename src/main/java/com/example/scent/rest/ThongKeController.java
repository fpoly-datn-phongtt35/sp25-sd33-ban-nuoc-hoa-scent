package com.example.scent.controller;

import com.example.scent.entity.ThongKe.SoLuongDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeTheoThoiGianDTO;
import com.example.scent.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thong-ke")
public class ThongKeController {

    @Autowired
    private ThongKeService thongKeService;

    // Endpoint for overall statistics (Tổng quan Cố định)
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
}