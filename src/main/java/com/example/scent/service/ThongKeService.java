package com.example.scent.service;

import com.example.scent.entity.ThongKe.BestSellingProductDTO;
import com.example.scent.entity.ThongKe.SoLuongDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeDonHangDTO;
import com.example.scent.entity.ThongKe.ThongKeTheoThoiGianDTO;
import com.example.scent.repo.CTDHInterface;
import com.example.scent.repo.DonHangInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ThongKeService {
    @Autowired
    CTDHInterface chiTietDonHangRepository;
    @Autowired
    private DonHangInterface donHangRepository;

    // Existing method for overall statistics (Tổng quan Cố định)
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

    // New method: Aggregated statistics for a date range (Theo ngày)
    public ThongKeDonHangDTO thongKeTongQuanTheoNgay(String startDate, String endDate) {
        List<Object[]> results = donHangRepository.thongKeTheoNgay(startDate, endDate);
        return aggregateThongKeDonHangDTO(results);
    }
    private ThongKeDonHangDTO aggregateThongKeDonHangDTOForWeek(List<Object[]> results) {
        // Nếu không có dữ liệu, trả về DTO với các giá trị mặc định là 0
        if (results == null || results.isEmpty()) {
            return new ThongKeDonHangDTO(
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    0L, 0L, 0L, 0L, 0L, 0L, 0L, null
            );
        }

        // Khởi tạo các biến để tổng hợp
        BigDecimal tongDoanhThu = BigDecimal.ZERO;
        BigDecimal doanhThuOnline = BigDecimal.ZERO;
        BigDecimal doanhThuOffline = BigDecimal.ZERO;
        long onlineHoanThanh = 0;
        long onlineHuy = 0;
        long offlineHoanThanh = 0;
        long offlineHuy = 0;
        long soLuongDon = 0;
        long soLuongDonOnline = 0;
        long soLuongDonOffline = 0;

        // Tổng hợp dữ liệu từ kết quả truy vấn
        for (Object[] result : results) {
            BigDecimal dailyTongDoanhThu = result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO;
            BigDecimal dailyDoanhThuOnline = result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO;
            BigDecimal dailyDoanhThuOffline = result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO;
            long dailyOnlineHoanThanh = result[5] != null ? ((Number) result[5]).longValue() : 0;
            long dailyOnlineHuy = result[6] != null ? ((Number) result[6]).longValue() : 0;
            long dailyOfflineHoanThanh = result[7] != null ? ((Number) result[7]).longValue() : 0;
            long dailyOfflineHuy = result[8] != null ? ((Number) result[8]).longValue() : 0;
            long dailySoLuongDon = result[9] != null ? ((Number) result[9]).longValue() : 0;

            // Tổng hợp
            tongDoanhThu = tongDoanhThu.add(dailyTongDoanhThu);
            doanhThuOnline = doanhThuOnline.add(dailyDoanhThuOnline);
            doanhThuOffline = doanhThuOffline.add(dailyDoanhThuOffline);
            onlineHoanThanh += dailyOnlineHoanThanh;
            onlineHuy += dailyOnlineHuy;
            offlineHoanThanh += dailyOfflineHoanThanh;
            offlineHuy += dailyOfflineHuy;
            soLuongDon += dailySoLuongDon;

            // Tính số lượng đơn online và offline
            soLuongDonOnline += dailyDoanhThuOnline.compareTo(BigDecimal.ZERO) > 0 ? dailySoLuongDon : 0;
            soLuongDonOffline += dailyDoanhThuOffline.compareTo(BigDecimal.ZERO) > 0 ? dailySoLuongDon : 0;
        }

        Double tiLeTangTruongDoanhThu = null;

        return new ThongKeDonHangDTO(
                tongDoanhThu, doanhThuOnline, doanhThuOffline,
                onlineHoanThanh, onlineHuy, offlineHoanThanh, offlineHuy,
                soLuongDon, soLuongDonOnline, soLuongDonOffline, tiLeTangTruongDoanhThu
        );
    }
    // New method: Aggregated statistics for a specific week (Theo tuần)
    public ThongKeDonHangDTO thongKeTongQuanTheoTuan(Integer year, Integer week) {
        List<Object[]> results = donHangRepository.thongKeTheoTuan(year, week);
        return aggregateThongKeDonHangDTOForWeek(results); // Sử dụng phương thức riêng
    }

    // New method: Aggregated statistics for a specific month (Theo tháng)
    public ThongKeDonHangDTO thongKeTongQuanTheoThang(Integer year, Integer month) {
        List<Object[]> results = donHangRepository.thongKeTheoThang(year, month);
        return aggregateThongKeDonHangDTO(results);
    }

    // New method: Aggregated statistics for a specific year (Theo năm)
    public ThongKeDonHangDTO thongKeTongQuanTheoNam(Integer year) {
        List<Object[]> results = donHangRepository.thongKeTheoNam(year);
        return aggregateThongKeDonHangDTO(results);
    }

    // Helper method to aggregate results into a ThongKeDonHangDTO
    private ThongKeDonHangDTO aggregateThongKeDonHangDTO(List<Object[]> results) {
        BigDecimal tongDoanhThu = BigDecimal.ZERO;
        BigDecimal doanhThuOnline = BigDecimal.ZERO;
        BigDecimal doanhThuOffline = BigDecimal.ZERO;
        long onlineHoanThanh = 0;
        long onlineHuy = 0;
        long offlineHoanThanh = 0;
        long offlineHuy = 0;
        long soLuongDon = 0;
        long soLuongDonOnline = 0;
        long soLuongDonOffline = 0;

        for (Object[] result : results) {
            BigDecimal dailyTongDoanhThu = (BigDecimal) result[1];
            BigDecimal dailyDoanhThuOnline = (BigDecimal) result[2];
            BigDecimal dailyDoanhThuOffline = (BigDecimal) result[3];
            long dailyOnlineHoanThanh = ((Number) result[4]).longValue();
            long dailyOnlineHuy = ((Number) result[5]).longValue();
            long dailyOfflineHoanThanh = ((Number) result[6]).longValue();
            long dailyOfflineHuy = ((Number) result[7]).longValue();
            long dailySoLuongDon = ((Number) result[8]).longValue();

            // Aggregate totals
            tongDoanhThu = tongDoanhThu.add(dailyTongDoanhThu != null ? dailyTongDoanhThu : BigDecimal.ZERO);
            doanhThuOnline = doanhThuOnline.add(dailyDoanhThuOnline != null ? dailyDoanhThuOnline : BigDecimal.ZERO);
            doanhThuOffline = doanhThuOffline.add(dailyDoanhThuOffline != null ? dailyDoanhThuOffline : BigDecimal.ZERO);
            onlineHoanThanh += dailyOnlineHoanThanh;
            onlineHuy += dailyOnlineHuy;
            offlineHoanThanh += dailyOfflineHoanThanh;
            offlineHuy += dailyOfflineHuy;
            soLuongDon += dailySoLuongDon;

            // Calculate online and offline order counts
            soLuongDonOnline += dailyDoanhThuOnline != null && dailyDoanhThuOnline.compareTo(BigDecimal.ZERO) > 0 ? dailySoLuongDon : 0;
            soLuongDonOffline += dailyDoanhThuOffline != null && dailyDoanhThuOffline.compareTo(BigDecimal.ZERO) > 0 ? dailySoLuongDon : 0;
        }

        // For simplicity, we're not calculating tiLeTangTruongDoanhThu for filtered data
        Double tiLeTangTruongDoanhThu = null;

        return new ThongKeDonHangDTO(tongDoanhThu, doanhThuOnline, doanhThuOffline,
                onlineHoanThanh, onlineHuy, offlineHoanThanh, offlineHuy, soLuongDon,
                soLuongDonOnline, soLuongDonOffline, tiLeTangTruongDoanhThu);
    }

    // Existing method for counting by luongBan and trangThai
    public long countByLuongBanAndTrangThai(Integer luongBan, Integer trangThai) {
        return donHangRepository.countByLuongBanAndTrangThai(luongBan, trangThai);
    }

    // Existing methods for SoLuongDonHangDTO (used for charts)
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

    // Existing methods for ThongKeTheoThoiGianDTO (used for charts)
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
    public Page<BestSellingProductDTO> getBestSellingProductsByDateRange(String startDate, String endDate, Pageable pageable) {
        Long offset = pageable.getOffset();
        Integer pageSize = pageable.getPageSize();
        List<Object[]> results = chiTietDonHangRepository.findBestSellingProductsByDateRange(startDate, endDate, offset, pageSize);
        Long total = chiTietDonHangRepository.countBestSellingProductsByDateRange(startDate, endDate);
        List<BestSellingProductDTO> dtos = mapToBestSellingProductDTO(results);
        return new PageImpl<>(dtos, pageable, total != null ? total : 0);
    }

    public Page<BestSellingProductDTO> getBestSellingProductsByWeek(Integer year, Integer week, Pageable pageable) {
        Long offset = pageable.getOffset();
        Integer pageSize = pageable.getPageSize();
        List<Object[]> results = chiTietDonHangRepository.findBestSellingProductsByWeek(year, week, offset, pageSize);
        Long total = chiTietDonHangRepository.countBestSellingProductsByWeek(year, week);
        List<BestSellingProductDTO> dtos = mapToBestSellingProductDTO(results);
        return new PageImpl<>(dtos, pageable, total != null ? total : 0);
    }

    public Page<BestSellingProductDTO> getBestSellingProductsByMonth(Integer year, Integer month, Pageable pageable) {
        Long offset = pageable.getOffset();
        Integer pageSize = pageable.getPageSize();
        List<Object[]> results = chiTietDonHangRepository.findBestSellingProductsByMonth(year, month, offset, pageSize);
        Long total = chiTietDonHangRepository.countBestSellingProductsByMonth(year, month);
        List<BestSellingProductDTO> dtos = mapToBestSellingProductDTO(results);
        return new PageImpl<>(dtos, pageable, total != null ? total : 0);
    }

    public Page<BestSellingProductDTO> getBestSellingProductsByYear(Integer year, Pageable pageable) {
        Long offset = pageable.getOffset();
        Integer pageSize = pageable.getPageSize();
        List<Object[]> results = chiTietDonHangRepository.findBestSellingProductsByYear(year, offset, pageSize);
        Long total = chiTietDonHangRepository.countBestSellingProductsByYear(year);
        List<BestSellingProductDTO> dtos = mapToBestSellingProductDTO(results);
        return new PageImpl<>(dtos, pageable, total != null ? total : 0);
    }

    private List<BestSellingProductDTO> mapToBestSellingProductDTO(List<Object[]> results) {
        List<BestSellingProductDTO> dtos = new ArrayList<>();
        for (Object[] result : results) {
            if (result.length < 15) { // Kiểm tra độ dài mảng (bây giờ là 15 cột)
                System.out.println("Invalid result length: " + result.length);
                continue;
            }
            Integer soLuongTonKho = (Integer) result[11];
            boolean stockWarning = soLuongTonKho < 7;

            dtos.add(new BestSellingProductDTO(
                    (Integer) result[0],  // idSanPham
                    (String) result[1],   // tenSanPham
                    (String) result[2],   // moTaSanPham
                    (String) result[3],   // thuongHieu
                    (String) result[4],   // nhomHuong
                    (String) result[5],   // danhMuc
                    (String) result[6],   // huongDau
                    (String) result[7],   // huongGiua
                    (String) result[8],   // huongCuoi
                    (String) result[13],  // stockStatus
                    (Integer) result[9],  // idSpct
                    (Integer) result[10], // dungTich
                    soLuongTonKho,        // soLuongTonKho
                    ((Number) result[12]).longValue(), // totalQuantitySold
                    stockWarning,         // stockWarning
                    ((Number) result[14]).longValue()  // soLuotTraHang
            ));
        }
        return dtos;
    }
}