package com.example.scent.service;

import com.example.scent.entity.ChatMessage;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.ChatMessageInterface;
import com.example.scent.repo.TaiKhoanInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatMessageInterface chatMessageRepository;

    @Autowired
    private TaiKhoanInterface taiKhoanRepository;

    public Integer createGuestUser() {
        TaiKhoan guest = new TaiKhoan();
        guest.setTenDangNhap("guest_" + System.currentTimeMillis());
        guest.setMatKhau(""); // Không cần mật khẩu
        guest.setVaiTro("GUEST");
        guest.setHoTen("Guest_" + System.currentTimeMillis());
        TaiKhoan savedGuest = taiKhoanRepository.save(guest);
        return savedGuest.getId();
    }

    public ChatMessage saveMessage(Integer senderId, Integer receiverId, String content) {
        TaiKhoan sender = taiKhoanRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderId));
        TaiKhoan receiver = taiKhoanRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + receiverId));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = chatMessageRepository.save(message);
        System.out.println("Message saved: " + savedMessage);

        return savedMessage;
    }

    public List<ChatMessage> getMessagesBetweenUsers(Integer user1Id, Integer user2Id) {
        return chatMessageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(user1Id, user2Id, user1Id, user2Id);
    }
    public List<ChatMessage> getMessagesForUser(Integer userId, List<Integer> adminStaffIds) {
        // Lấy tất cả tin nhắn mà user gửi hoặc nhận từ admin/staff
        List<ChatMessage> messages = new ArrayList<>();

        // Tin nhắn user gửi (senderId = userId)
        List<ChatMessage> sentMessages = chatMessageRepository.findBySenderId(userId);

        // Tin nhắn user nhận (receiverId = userId)
        List<ChatMessage> receivedMessages = chatMessageRepository.findByReceiverId(userId);

        // Kết hợp tất cả tin nhắn
        messages.addAll(sentMessages);
        messages.addAll(receivedMessages);

        // Loại bỏ trùng lặp và sắp xếp theo thời gian
        messages = messages.stream()
                .distinct()
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());


        return messages;
    }

    public List<TaiKhoan> getUsersWithMessages(Integer adminId) {
        List<ChatMessage> messages = chatMessageRepository.findBySenderIdOrReceiverId(adminId, adminId);
        Set<Integer> userIds = messages.stream()
                .map(msg -> msg.getSender().getId().equals(adminId) ? msg.getReceiver().getId() : msg.getSender().getId())
                .collect(Collectors.toSet());
        return taiKhoanRepository.findByIdIn(new ArrayList<>(userIds));
    }
}