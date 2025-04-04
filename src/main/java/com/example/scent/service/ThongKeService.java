package com.example.scent.service;

import com.example.scent.entity.ThongKe.SoLuongDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeTheoThoiGianDTO;
import com.example.scent.repo.DonHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ThongKeService {

    @Autowired
    private DonHangInterface donHangRepository;

    public ThongKeDonHangDTO thongKeTongQuan() {
        BigDecimal tongDoanhThu = donHangRepository.getTotalRevenue() != null ? donHangRepository.getTotalRevenue() : BigDecimal.ZERO;
        BigDecimal doanhThuOnline = donHangRepository.getRevenueOnline() != null ? donHangRepository.getRevenueOnline() : BigDecimal.ZERO;
        BigDecimal doanhThuOffline = donHangRepository.getRevenueOffline() != null ? donHangRepository.getRevenueOffline() : BigDecimal.ZERO;
        long onlineHoanThanh = donHangRepository.countByLuongBanAndTrangThai(1, 4);
        long onlineHuy = donHangRepository.countByLuongBanAndTrangThai(1, 5);
        long offlineHoanThanh = donHangRepository.countByLuongBanAndTrangThai(0, 4);
        long offlineHuy = donHangRepository.countByLuongBanAndTrangThai(0, 5);
        long soLuongDon = donHangRepository.count();
        long soLuongDonOnline = donHangRepository.countOnlineOrders();
        long soLuongDonOffline = donHangRepository.countOfflineOrders();

        // Tính tỉ lệ tăng trưởng doanh thu so với năm trước
        Double tiLeTangTruongDoanhThu = null;
        int currentYear = LocalDate.now().getYear();
        BigDecimal doanhThuNamTruoc = donHangRepository.getTotalRevenueByYear(currentYear - 1);
        if (doanhThuNamTruoc != null && doanhThuNamTruoc.compareTo(BigDecimal.ZERO) != 0) {
            tiLeTangTruongDoanhThu = tongDoanhThu.subtract(doanhThuNamTruoc)
                    .divide(doanhThuNamTruoc, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return new ThongKeDonHangDTO(tongDoanhThu, doanhThuOnline, doanhThuOffline,
                onlineHoanThanh, onlineHuy, offlineHoanThanh, offlineHuy, soLuongDon,
                soLuongDonOnline, soLuongDonOffline, tiLeTangTruongDoanhThu);
    }

    public long countByLuongBanAndTrangThai(Integer luongBan, Integer trangThai) {
        return donHangRepository.countByLuongBanAndTrangThai(luongBan, trangThai);
    }

    public List<SoLuongDonHangDTO> getSoLuongDonTheoNgay(String startDate, String endDate) {
        List<Object[]> results = donHangRepository.getSoLuongDonTheoNgay(startDate, endDate);
        List<SoLuongDonHangDTO> dtos = new ArrayList<>();

        for (Object[] result : results) {
            dtos.add(new SoLuongDonHangDTO(
                    result[0].toString(), // ngay
                    ((Number) result[1]).longValue() // soLuongDon
            ));
        }
        return dtos;
    }

    public List<SoLuongDonHangDTO> getSoLuongDonTheoTuan(Integer year, Integer week) {
        List<Object[]> results = donHangRepository.getSoLuongDonTheoTuan(year, week);
        List<SoLuongDonHangDTO> dtos = new ArrayList<>();

        for (Object[] result : results) {
            dtos.add(new SoLuongDonHangDTO(
                    result[0] + "-W" + String.format("%02d", ((Number) result[1]).intValue()), // nam-tuan
                    ((Number) result[2]).longValue() // soLuongDon
            ));
        }
        return dtos;
    }

    public List<SoLuongDonHangDTO> getSoLuongDonTheoThang(Integer year, Integer month) {
        List<Object[]> results = donHangRepository.getSoLuongDonTheoThang(year, month);
        List<SoLuongDonHangDTO> dtos = new ArrayList<>();

        for (Object[] result : results) {
            dtos.add(new SoLuongDonHangDTO(
                    result[0].toString(), // thang
                    ((Number) result[1]).longValue() // soLuongDon
            ));
        }
        return dtos;
    }

    public List<SoLuongDonHangDTO> getSoLuongDonTheoNam(Integer year) {
        List<Object[]> results = donHangRepository.getSoLuongDonTheoNam(year);
        List<SoLuongDonHangDTO> dtos = new ArrayList<>();

        for (Object[] result : results) {
            dtos.add(new SoLuongDonHangDTO(
                    result[0].toString(), // nam
                    ((Number) result[1]).longValue() // soLuongDon
            ));
        }
        return dtos;
    }

    public List<ThongKeTheoThoiGianDTO> thongKeTheoNgay(String startDate, String endDate) {
        List<Object[]> results = donHangRepository.thongKeTheoNgay(startDate, endDate);
        List<ThongKeTheoThoiGianDTO> dtos = new ArrayList<>();

        for (int i = 0; i < results.size(); i++) {
            Object[] result = results.get(i);
            BigDecimal tongDoanhThu = (BigDecimal) result[1];
            Double tiLeTangTruong = null;

            if (i > 0) {
                BigDecimal doanhThuTruoc = (BigDecimal) results.get(i - 1)[1];
                if (doanhThuTruoc != null && doanhThuTruoc.compareTo(BigDecimal.ZERO) != 0) {
                    tiLeTangTruong = tongDoanhThu.subtract(doanhThuTruoc)
                            .divide(doanhThuTruoc, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            dtos.add(new ThongKeTheoThoiGianDTO(
                    result[0].toString(), // ngay
                    tongDoanhThu, // tongDoanhThu
                    (BigDecimal) result[2], // doanhThuOnline
                    (BigDecimal) result[3], // doanhThuOffline
                    ((Number) result[4]).longValue(), // onlineHoanThanh
                    ((Number) result[5]).longValue(), // onlineHuy
                    ((Number) result[6]).longValue(), // offlineHoanThanh
                    ((Number) result[7]).longValue(), // offlineHuy
                    ((Number) result[8]).longValue(), // soLuongDon
                    tiLeTangTruong // tiLeTangTruongDoanhThu
            ));
        }
        return dtos;
    }

    public List<ThongKeTheoThoiGianDTO> thongKeTheoTuan(Integer year, Integer week) {
        List<Object[]> results = donHangRepository.thongKeTheoTuan(year, week);
        List<ThongKeTheoThoiGianDTO> dtos = new ArrayList<>();

        for (int i = 0; i < results.size(); i++) {
            Object[] result = results.get(i);
            BigDecimal tongDoanhThu = (BigDecimal) result[2];
            Double tiLeTangTruong = null;

            if (i > 0) {
                BigDecimal doanhThuTruoc = (BigDecimal) results.get(i - 1)[2];
                if (doanhThuTruoc != null && doanhThuTruoc.compareTo(BigDecimal.ZERO) != 0) {
                    tiLeTangTruong = tongDoanhThu.subtract(doanhThuTruoc)
                            .divide(doanhThuTruoc, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            dtos.add(new ThongKeTheoThoiGianDTO(
                    result[0] + "-W" + String.format("%02d", ((Number) result[1]).intValue()), // nam-tuan
                    tongDoanhThu, // tongDoanhThu
                    (BigDecimal) result[3], // doanhThuOnline
                    (BigDecimal) result[4], // doanhThuOffline
                    ((Number) result[5]).longValue(), // onlineHoanThanh
                    ((Number) result[6]).longValue(), // onlineHuy
                    ((Number) result[7]).longValue(), // offlineHoanThanh
                    ((Number) result[8]).longValue(), // offlineHuy
                    ((Number) result[9]).longValue(), // soLuongDon
                    tiLeTangTruong // tiLeTangTruongDoanhThu
            ));
        }
        return dtos;
    }

    public List<ThongKeTheoThoiGianDTO> thongKeTheoThang(Integer year, Integer month) {
        List<Object[]> results = donHangRepository.thongKeTheoThang(year, month);
        List<ThongKeTheoThoiGianDTO> dtos = new ArrayList<>();

        for (int i = 0; i < results.size(); i++) {
            Object[] result = results.get(i);
            BigDecimal tongDoanhThu = (BigDecimal) result[1];
            Double tiLeTangTruong = null;

            if (i > 0) {
                BigDecimal doanhThuTruoc = (BigDecimal) results.get(i - 1)[1];
                if (doanhThuTruoc != null && doanhThuTruoc.compareTo(BigDecimal.ZERO) != 0) {
                    tiLeTangTruong = tongDoanhThu.subtract(doanhThuTruoc)
                            .divide(doanhThuTruoc, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            dtos.add(new ThongKeTheoThoiGianDTO(
                    result[0].toString(), // thang
                    tongDoanhThu, // tongDoanhThu
                    (BigDecimal) result[2], // doanhThuOnline
                    (BigDecimal) result[3], // doanhThuOffline
                    ((Number) result[4]).longValue(), // onlineHoanThanh
                    ((Number) result[5]).longValue(), // onlineHuy
                    ((Number) result[6]).longValue(), // offlineHoanThanh
                    ((Number) result[7]).longValue(), // offlineHuy
                    ((Number) result[8]).longValue(), // soLuongDon
                    tiLeTangTruong // tiLeTangTruongDoanhThu
            ));
        }
        return dtos;
    }

    public List<ThongKeTheoThoiGianDTO> thongKeTheoNam(Integer year) {
        List<Object[]> results = donHangRepository.thongKeTheoNam(year);
        List<ThongKeTheoThoiGianDTO> dtos = new ArrayList<>();

        for (int i = 0; i < results.size(); i++) {
            Object[] result = results.get(i);
            BigDecimal tongDoanhThu = (BigDecimal) result[1];
            // Kiểm tra nếu không có dữ liệu, trả về doanh thu bằng 0
            if (tongDoanhThu == null) {
                tongDoanhThu = BigDecimal.ZERO;
            }
            Double tiLeTangTruong = null;

            if (i > 0) {
                BigDecimal doanhThuTruoc = (BigDecimal) results.get(i - 1)[1];
                if (doanhThuTruoc != null && doanhThuTruoc.compareTo(BigDecimal.ZERO) != 0) {
                    tiLeTangTruong = tongDoanhThu.subtract(doanhThuTruoc)
                            .divide(doanhThuTruoc, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            dtos.add(new ThongKeTheoThoiGianDTO(
                    result[0].toString(), // nam
                    tongDoanhThu, // tongDoanhThu
                    (BigDecimal) result[2], // doanhThuOnline
                    (BigDecimal) result[3], // doanhThuOffline
                    ((Number) result[4]).longValue(), // onlineHoanThanh
                    ((Number) result[5]).longValue(), // onlineHuy
                    ((Number) result[6]).longValue(), // offlineHoanThanh
                    ((Number) result[7]).longValue(), // offlineHuy
                    ((Number) result[8]).longValue(), // soLuongDon
                    tiLeTangTruong // tiLeTangTruongDoanhThu
            ));
        }
        return dtos;
    }
}