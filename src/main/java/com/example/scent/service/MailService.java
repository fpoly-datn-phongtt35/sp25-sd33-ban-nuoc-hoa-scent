package com.example.scent.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.MimeMessageHelper;
@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;
    @Async
    public void sendOtpEmail(String to, String otp) {
        String subject = "Mã OTP khôi phục mật khẩu";
        String body = "<html>" +
                "<body>" +
                "<div style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #4CAF50;'>Chào bạn,</h2>" +
                "<p style='font-size: 16px;'>Cảm ơn bạn đã sử dụng dịch vụ của <b>Scent</b>!<br>" +
                "Mã OTP khôi phục mật khẩu của bạn là:</p>" +
                "<h3 style='color: #FF5722;'>" + otp + "</h3>" +
                "<p style='font-size: 14px;'>Mã OTP sẽ hết hạn sau 30 giây. Vui lòng nhập mã này để tiếp tục quá trình khôi phục mật khẩu.</p>" +
                "<footer style='margin-top: 20px;'>" +
                "<p style='font-size: 12px; color: #888;'>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>" +
                "</footer>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendHtmlEmail(to, subject, body);
    }
    @Async
    public void sendNewPasswordEmail(String email, String newPassword) {
        String subject = "Mật khẩu mới của bạn - Scent";
        String body = "<html>" +
                "<body>" +
                "<div style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #4CAF50;'>Chào bạn,</h2>" +
                "<p style='font-size: 16px;'>Mật khẩu mới của bạn cho tài khoản tại <b>Scent</b> đã được tạo thành công.</p>" +
                "<h3 style='color: #FF5722;'>Mật khẩu mới: " + newPassword + "</h3>" +
                "<p style='font-size: 14px;'>Vui lòng sử dụng mật khẩu này để đăng nhập vào tài khoản của bạn. Đảm bảo thay đổi mật khẩu sau khi đăng nhập thành công để bảo mật tài khoản của bạn.</p>" +
                "<footer style='margin-top: 20px;'>" +
                "<p style='font-size: 12px; color: #888;'>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.</p>" +
                "</footer>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendHtmlEmail(email, subject, body);
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);  // Chú ý: Tham số thứ 2 là true để gửi email dạng HTML
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }



}
