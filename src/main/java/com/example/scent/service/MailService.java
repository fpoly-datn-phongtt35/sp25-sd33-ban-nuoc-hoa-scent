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
    public void sendNewPasswordEmail(String email, String username, String newPassword) {
        String subject = "Mật khẩu mới của bạn - Scent";
        String body = "<html>" +
                "<body>" +
                "<div style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #4CAF50;'>Chào " + (username != null ? username : "bạn") + ",</h2>" +
                "<p style='font-size: 16px;'>Mật khẩu mới cho tài khoản <b>" + (username != null ? username : "của bạn") + "</b> tại <b>Scent</b> đã được tạo thành công.</p>" +
                "<h3 style='color: #FF5722;'>Mật khẩu mới: " + newPassword + "</h3>" +
                "<p style='font-size: 14px;'>Vui lòng sử dụng tên đăng nhập <b>" + (username != null ? username : "email của bạn") + "</b> và mật khẩu này để đăng nhập vào tài khoản của bạn.</p>" +
                "<p style='font-size: 14px;'>Đảm bảo thay đổi mật khẩu sau khi đăng nhập thành công để bảo mật tài khoản của bạn.</p>" +
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
            helper.setFrom("laivanquang986@gmail.com"); // Thêm dòng này
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);  // true = gửi email dạng HTML
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Async
    public void sendNewAccountEmail(String email, String username, String newPassword, String hoTen) {
        String subject = "Tài khoản mới của bạn - Scent";
        String body = "<html>" +
                "<body>" +
                "<div style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #4CAF50;'>Chào " + (hoTen != null ? hoTen : "bạn") + ",</h2>" +
                "<p style='font-size: 16px;'>Tài khoản nhân viên của bạn tại <b>Scent</b> đã được tạo thành công.</p>" +
                "<h3 style='color: #FF5722;'>Thông tin đăng nhập:</h3>" +
                "<p style='font-size: 14px;'>Tên đăng nhập: <b>" + (username != null ? username : "email của bạn") + "</b></p>" +
                "<p style='font-size: 14px;'>Mật khẩu: <b>" + newPassword + "</b></p>" +
                "<p style='font-size: 14px;'>Vui lòng sử dụng thông tin này để đăng nhập vào tài khoản của bạn. Đảm bảo thay đổi mật khẩu sau khi đăng nhập thành công để bảo mật tài khoản.</p>" +
                "<footer style='margin-top: 20px;'>" +
                "<p style='font-size: 12px; color: #888;'>Nếu bạn không yêu cầu tạo tài khoản, vui lòng liên hệ với chúng tôi ngay lập tức.</p>" +
                "</footer>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendHtmlEmail(email, subject, body);
    }


}
