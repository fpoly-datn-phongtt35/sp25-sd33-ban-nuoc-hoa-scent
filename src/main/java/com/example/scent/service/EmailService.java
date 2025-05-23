package com.example.scent.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendCouponEmail(String to, String couponCode, BigDecimal discount, LocalDate startDate, LocalDate endDate) {
        try {
            if (!EMAIL_PATTERN.matcher(to).matches()) {
                throw new IllegalArgumentException("Địa chỉ email không hợp lệ: " + to);
            }
            if (startDate == null || endDate == null) {
                throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc không được để trống");
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("laivanquang986@gmail.com");
            message.setTo(to);
            message.setSubject("Mã giảm giá từ SCENT");

            String username = to.contains("@") ? to.split("@")[0] : "Khách hàng";
            message.setText(String.format(
                    "Chào bạn %s,\n\nMã giảm giá của bạn là: %s\nGiá trị giảm: %s%%\nThời gian bắt đầu: %s\nThời gian kết thúc: %s\nLưu ý:\n+Phiếu giảm giá chỉ sử dụng khi mua hàng trực tuyến\n+Mỗi phiếu giảm giá chỉ được sử dụng 1 lần cho 1 tài khoản\n\nCảm ơn bạn đã sử dụng dịch vụ!\n\nTrân trọng,\nĐội ngũ SCENT",
                    username, couponCode, discount.multiply(new BigDecimal(100)).toString(),
                    startDate.format(DATE_FORMATTER), endDate.format(DATE_FORMATTER)));

            mailSender.send(message);
            logger.info("Gửi email thành công tới: {}", to);
        } catch (MailException e) {
            logger.error("Lỗi khi gửi email tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi gửi email tới {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Lỗi không xác định khi gửi email: " + e.getMessage(), e);
        }
    }
}