package com.example.scent.rest;

import com.example.scent.entity.ChatMessage;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TaiKhoanInterface taiKhoanRepository;

    @MessageMapping("/admin-to-user/{senderId}/{receiverId}")
    public void sendMessageFromAdminToUser(
            @DestinationVariable Integer senderId,
            @DestinationVariable Integer receiverId,
            String messageBody
    ) {
        try {
            System.out.println("[ChatController] Nhận tin nhắn từ admin: " + messageBody);

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            Map<String, Object> messageMap = objectMapper.readValue(messageBody, Map.class);
            String content = (String) messageMap.get("content");

            System.out.println("[ChatController] Nội dung tin nhắn: " + content);

            if (content == null || content.trim().isEmpty()) {
                System.err.println("[ChatController] Nội dung tin nhắn rỗng hoặc null");
                return;
            }

            TaiKhoan sender = taiKhoanRepository.findById(senderId).orElse(null);
            if (sender == null) {
                System.err.println("[ChatController] Không tìm thấy admin với ID: " + senderId);
                return;
            }

            TaiKhoan receiver = taiKhoanRepository.findById(receiverId).orElse(null);
            if (receiver == null) {
                System.err.println("[ChatController] Không tìm thấy khách hàng với ID: " + receiverId);
                return;
            }

            ChatMessage savedMessage = chatService.saveMessage(senderId, receiverId, content);
            if (savedMessage == null) {
                System.err.println("[ChatController] Lưu tin nhắn thất bại cho admin: " + senderId + ", khách hàng: " + receiverId);
                return;
            }

            savedMessage.setSender(sender);
            savedMessage.setReceiver(receiver);

            if (savedMessage.getId() == null) {
                System.err.println("[ChatController] ID của tin nhắn không được gán sau khi lưu!");
            }

            messagingTemplate.convertAndSend("/topic/messages/" + receiverId, savedMessage);
            System.out.println("[ChatController] Đã gửi tin nhắn đến khách hàng qua /topic/messages/" + receiverId + ": " + savedMessage.getContent());

            messagingTemplate.convertAndSend("/topic/admin-messages/" + senderId, savedMessage);
            System.out.println("[ChatController] Đã gửi lại tin nhắn cho admin qua /topic/admin-messages/" + senderId + ": " + savedMessage.getContent());
        } catch (Exception e) {
            System.err.println("[ChatController] Lỗi khi xử lý tin nhắn từ admin đến khách hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/user-to-admin/{senderId}")
    public void sendMessageFromUserToAdmin(
            @DestinationVariable("senderId") Integer senderId,
            ChatMessage chatMessage
    ) {
        System.out.println("[ChatController] Nhận tin nhắn từ user ID " + senderId + ": " + chatMessage.getContent());

        // Lấy thông tin người gửi
        TaiKhoan sender = taiKhoanRepository.findById(senderId).orElse(null);
        if (sender == null) {
            System.out.println("[ChatController] Không tìm thấy người gửi với ID: " + senderId);
            return;
        }
        chatMessage.setSender(sender);

        // Lấy danh sách tất cả admin và staff
        List<TaiKhoan> adminsAndStaff = taiKhoanRepository.findAllAdminsAndStaff();
        if (adminsAndStaff.isEmpty()) {
            System.out.println("[ChatController] Không tìm thấy admin/staff để gửi tin nhắn.");
            return;
        }

        // Gửi tin nhắn đến từng admin/staff và lưu tin nhắn
        for (TaiKhoan admin : adminsAndStaff) {
            Integer adminId = admin.getId();
            // Lưu tin nhắn vào cơ sở dữ liệu
            ChatMessage savedMessage = chatService.saveMessage(senderId, adminId, chatMessage.getContent());
            if (savedMessage == null) {
                System.out.println("[ChatController] Lưu tin nhắn thất bại cho admin: " + adminId);
                continue;
            }
            savedMessage.setSender(sender);
            savedMessage.setReceiver(admin);

            if (savedMessage.getId() == null) {
                System.err.println("[ChatController] ID của tin nhắn không được gán sau khi lưu!");
            }

            // Gửi tin nhắn đến admin/staff qua WebSocket
            messagingTemplate.convertAndSend("/topic/admin-messages/" + adminId, savedMessage);
            System.out.println("[ChatController] Đã gửi tin nhắn đến /topic/admin-messages/" + adminId + ": " + savedMessage.getContent());

            // Gửi tin nhắn lại cho khách hàng để xác nhận
            messagingTemplate.convertAndSend("/topic/messages/" + senderId, savedMessage);
            System.out.println("[ChatController] Đã gửi tin nhắn lại cho khách hàng qua /topic/messages/" + senderId + ": " + savedMessage.getContent());
        }
    }

    @GetMapping("/messages/{user1Id}/{user2Id}")
    public List<ChatMessage> getMessages(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
        return chatService.getMessagesBetweenUsers(user1Id, user2Id);
    }

    @GetMapping("/messages/user/{userId}")
    public List<ChatMessage> getMessagesForUser(@PathVariable Integer userId) {
        List<TaiKhoan> adminsAndStaff = taiKhoanRepository.findByVaiTroIn(List.of("ADMIN", "STAFF"));
        List<Integer> adminStaffIds = adminsAndStaff.stream().map(TaiKhoan::getId).collect(Collectors.toList());
        return chatService.getMessagesForUser(userId, adminStaffIds);
    }

    @PostMapping("/add-user/{adminId}")
    public void addUserToAdminChatList(
            @PathVariable Integer adminId,
            @RequestBody TaiKhoan user
    ) {
        try {
            System.out.println("[ChatController] Thêm user vào danh sách chat của admin ID: " + adminId + ", user: " + user.getId());

            TaiKhoan admin = taiKhoanRepository.findById(adminId).orElse(null);
            if (admin == null) {
                System.err.println("[ChatController] Không tìm thấy admin với ID: " + adminId);
                throw new RuntimeException("Admin not found with ID: " + adminId);
            }

            TaiKhoan existingUser = taiKhoanRepository.findById(user.getId()).orElse(null);
            if (existingUser == null) {
                System.err.println("[ChatController] Không tìm thấy user với ID: " + user.getId());
                throw new RuntimeException("User not found with ID: " + user.getId());
            }

            List<TaiKhoan> usersWithMessages = chatService.getUsersWithMessages(adminId);
            if (usersWithMessages.stream().anyMatch(u -> u.getId().equals(user.getId()))) {
                System.out.println("[ChatController] User " + user.getId() + " đã tồn tại trong danh sách chat của admin " + adminId);
                return;
            }

            ChatMessage savedMessage = chatService.saveMessage(user.getId(), adminId, "Bắt đầu cuộc trò chuyện");
            if (savedMessage == null) {
                System.err.println("[ChatController] Lưu tin nhắn thất bại cho admin: " + adminId + ", user: " + user.getId());
                throw new RuntimeException("Failed to save message for user: " + user.getId());
            }

            savedMessage.setSender(existingUser);
            savedMessage.setReceiver(admin);

            messagingTemplate.convertAndSend("/topic/admin-messages/" + adminId, savedMessage);
            System.out.println("[ChatController] Đã gửi tin nhắn khởi tạo đến /topic/admin-messages/" + adminId + ": " + savedMessage.getContent());
        } catch (Exception e) {
            System.err.println("[ChatController] Lỗi khi thêm user vào danh sách chat của admin: " + e.getMessage());
            throw new RuntimeException("Failed to add user to admin chat list", e);
        }
    }

    @GetMapping("/messages/user/{adminId}/{userId}")
    public List<ChatMessage> getMessagesBetweenAdminAndUser(
            @PathVariable Integer adminId,
            @PathVariable Integer userId
    ) {
        return chatService.getMessagesBetweenUsers(adminId, userId);
    }

    @GetMapping("/users-with-messages/{adminId}")
    public List<TaiKhoan> getUsersWithMessages(@PathVariable Integer adminId) {
        return chatService.getUsersWithMessages(adminId);
    }

    @PostMapping("/create-guest")
    public Map<String, Integer> createGuestUser() {
        try {
            Integer guestId = chatService.createGuestUser();
            return Map.of("userId", guestId);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo guest user: " + e.getMessage());
            throw new RuntimeException("Không thể tạo guest user", e);
        }
    }

    @PostMapping("/webhook")
    public void handleWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println("Received webhook payload: " + payload);
        try {
            if (payload == null || !payload.containsKey("message")) {
                System.out.println("Cannot process message: Invalid or missing payload");
                return;
            }

            String message = (String) payload.get("message");
            if (message == null || message.trim().isEmpty()) {
                System.out.println("Cannot process message: Missing message content");
                return;
            }

            Map<String, Object> visitor = (Map<String, Object>) payload.get("visitor");
            Integer senderId = visitor != null && visitor.get("userId") != null
                    ? Integer.parseInt(visitor.get("userId").toString())
                    : null;

            if (senderId == null) {
                senderId = chatService.createGuestUser();
                System.out.println("Created guest user with ID: " + senderId);
            }

            List<TaiKhoan> adminsAndStaff = taiKhoanRepository.findByVaiTroIn(List.of("ADMIN", "STAFF"));
            if (adminsAndStaff.isEmpty()) {
                throw new RuntimeException("No admin or staff found to receive the message");
            }

            for (TaiKhoan admin : adminsAndStaff) {
                Integer receiverId = admin.getId();
                ChatMessage savedMessage = chatService.saveMessage(senderId, receiverId, message);
                messagingTemplate.convertAndSend("/topic/messages/" + receiverId, savedMessage);
            }
        } catch (Exception e) {
            System.err.println("Error processing webhook: " + e.getMessage());
            throw new RuntimeException("Failed to process webhook", e);
        }
    }
}