package com.example.scent.rest;

import com.example.scent.entity.ThongKe.SoLuongDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeTheoThoiGianDTO;
import com.example.scent.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/thong-ke")
public class ThongKeController {

    @Autowired
    private ThongKeService thongKeService;

    @GetMapping("/tong-quan")
    public ResponseEntity<ThongKeDonHangDTO> thongKeTongQuan() {
        ThongKeDonHangDTO thongKe = thongKeService.thongKeTongQuan();
        return ResponseEntity.ok(thongKe);
    }

    @GetMapping("/count-by-luong-ban-trang-thai")
    public ResponseEntity<Long> countByLuongBanAndTrangThai(
            @RequestParam("luongBan") Integer luongBan,
            @RequestParam("trangThai") Integer trangThai) {
        long count = thongKeService.countByLuongBanAndTrangThai(luongBan, trangThai);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/so-luong-don/ngay")
    public ResponseEntity<List<SoLuongDonHangDTO>> getSoLuongDonTheoNgay(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        List<SoLuongDonHangDTO> result = thongKeService.getSoLuongDonTheoNgay(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/so-luong-don/tuan")
    public ResponseEntity<List<SoLuongDonHangDTO>> getSoLuongDonTheoTuan(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week) {
        List<SoLuongDonHangDTO> result = thongKeService.getSoLuongDonTheoTuan(year, week);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/so-luong-don/thang")
    public ResponseEntity<List<SoLuongDonHangDTO>> getSoLuongDonTheoThang(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        List<SoLuongDonHangDTO> result = thongKeService.getSoLuongDonTheoThang(year, month);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/so-luong-don/nam")
    public ResponseEntity<List<SoLuongDonHangDTO>> getSoLuongDonTheoNam(
            @RequestParam(value = "year", required = false) Integer year) {
        List<SoLuongDonHangDTO> result = thongKeService.getSoLuongDonTheoNam(year);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/doanh-thu/ngay")
    public ResponseEntity<List<ThongKeTheoThoiGianDTO>> thongKeTheoNgay(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        List<ThongKeTheoThoiGianDTO> result = thongKeService.thongKeTheoNgay(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/doanh-thu/tuan")
    public ResponseEntity<List<ThongKeTheoThoiGianDTO>> thongKeTheoTuan(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "week", required = false) Integer week) {
        List<ThongKeTheoThoiGianDTO> result = thongKeService.thongKeTheoTuan(year, week);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/doanh-thu/thang")
    public ResponseEntity<List<ThongKeTheoThoiGianDTO>> thongKeTheoThang(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month) {
        List<ThongKeTheoThoiGianDTO> result = thongKeService.thongKeTheoThang(year, month);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/doanh-thu/nam")
    public ResponseEntity<List<ThongKeTheoThoiGianDTO>> thongKeTheoNam(
            @RequestParam(value = "year", required = false) Integer year) {
        List<ThongKeTheoThoiGianDTO> result = thongKeService.thongKeTheoNam(year);
        return ResponseEntity.ok(result);
    }
}