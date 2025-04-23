package com.example.scent.rest;

import com.example.scent.entity.ChatMessage;
import com.example.scent.entity.TaiKhoan;
import com.example.scent.repo.TaiKhoanInterface;
import com.example.scent.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TaiKhoanInterface taiKhoanRepository;

    private static final String TRIGGER_CONSULT_PRODUCT = "tôi cần tư vấn sản phẩm";
    private static final String TRIGGER_TOP_10 = "top 10 sản phẩm bán chạy";
    private static final String TRIGGER_BY_BRAND = "tìm sản phẩm theo thương hiệu";
    private static final String TRIGGER_BY_FRAGRANCE = "tìm sản phẩm theo nhóm hương";
    private static final Integer BOT_SENDER_ID = 0;
    private static final List<String> EXIT_KEYWORDS = Arrays.asList("admin", "thoát", "nói chuyện với admin", "người thật");

    @GetMapping("/chat-search")
    public List<Map<String, Object>> searchProductsByName(@RequestParam String name) {
        return chatService.searchProductsByName(name);
    }

    @GetMapping("/top-10-products")
    public List<Map<String, Object>> getTop10Products() {
        return chatService.getTop10Products();
    }

    @GetMapping("/brands")
    public List<Map<String, Object>> getAllBrands() {
        return chatService.getAllBrands();
    }

    @GetMapping("/products-by-brand")
    public List<Map<String, Object>> getProductsByBrand(@RequestParam Integer brandId) {
        return chatService.getProductsByBrand(brandId);
    }

    @GetMapping("/fragrance-groups")
    public List<Map<String, Object>> getAllFragranceGroups() {
        return chatService.getAllFragranceGroups();
    }

    @GetMapping("/products-by-fragrance-group")
    public List<Map<String, Object>> getProductsByFragranceGroup(@RequestParam Integer groupId) {
        return chatService.getProductsByFragranceGroup(groupId);
    }

    @GetMapping("/{productId}/details")
    public Map<String, Object> getProductDetails(@PathVariable Integer productId, @RequestParam String infoType) {
        return chatService.getProductDetails(productId, infoType);
    }

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

        // Kiểm tra nếu khách hàng muốn thoát luồng bot và nói chuyện trực tiếp với admin
        String userMessage = chatMessage.getContent().toLowerCase().trim();
        if (EXIT_KEYWORDS.stream().anyMatch(keyword -> userMessage.contains(keyword))) {
            String botResponse = "Được rồi, tôi sẽ chuyển bạn đến admin ngay bây giờ. Vui lòng chờ trong giây lát!";
            sendBotResponse(senderId, adminsAndStaff, botResponse);

            // Gửi tin nhắn khởi tạo để admin biết khách hàng muốn nói chuyện trực tiếp
            String initMessage = "Khách hàng " + sender.getTenDangNhap() + " muốn nói chuyện trực tiếp với admin.";
            for (TaiKhoan admin : adminsAndStaff) {
                Integer adminId = admin.getId();
                ChatMessage savedMessage = chatService.saveMessage(senderId, adminId, initMessage);
                savedMessage.setSender(sender);
                savedMessage.setReceiver(admin);

                messagingTemplate.convertAndSend("/topic/admin-messages/" + adminId, savedMessage);
                messagingTemplate.convertAndSend("/topic/messages/" + senderId, savedMessage);
            }
            return; // Thoát luồng bot
        }

        // Kiểm tra trạng thái trò chuyện với admin
        List<Integer> adminStaffIds = adminsAndStaff.stream().map(TaiKhoan::getId).collect(Collectors.toList());
        boolean isChattingWithAdmin = chatService.getMessagesForUser(senderId, adminStaffIds).stream()
                .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(senderId))
                .anyMatch(msg -> EXIT_KEYWORDS.stream().anyMatch(keyword -> msg.getContent().toLowerCase().trim().contains(keyword)));

        // Nếu chưa trò chuyện với admin, xử lý luồng bot
        if (!isChattingWithAdmin) {
            // Kiểm tra nếu tin nhắn khớp với trigger "tôi cần tư vấn sản phẩm"
            if (userMessage.equals(TRIGGER_CONSULT_PRODUCT)) {
                String botResponse = "Bạn cần tư vấn về sản phẩm nào ạ? Mời bạn nhập tên sản phẩm.";
                sendBotResponse(senderId, adminsAndStaff, botResponse);
                return;
            }

            // Kiểm tra nếu tin nhắn khớp với trigger "top 10 sản phẩm bán chạy"
            if (userMessage.equals(TRIGGER_TOP_10)) {
                List<Map<String, Object>> products = chatService.getTop10Products();
                if (products.isEmpty()) {
                    String botResponse = "Hiện tại không có sản phẩm bán chạy nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                StringBuilder botResponse = new StringBuilder("Danh sách 10 sản phẩm bán chạy nhất:\n");
                for (int i = 0; i < products.size(); i++) {
                    Map<String, Object> product = products.get(i);
                    botResponse.append(i + 1).append(". ").append(product.get("name")).append("\n");
                }
                botResponse.append("Bạn muốn hỏi về sản phẩm nào ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                return;
            }

            // Kiểm tra nếu tin nhắn khớp với trigger "tìm sản phẩm theo thương hiệu"
            if (userMessage.equals(TRIGGER_BY_BRAND)) {
                List<Map<String, Object>> brands = chatService.getAllBrands();
                if (brands.isEmpty()) {
                    String botResponse = "Hiện tại không có thương hiệu nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                StringBuilder botResponse = new StringBuilder("Danh sách thương hiệu:\n");
                for (int i = 0; i < brands.size(); i++) {
                    Map<String, Object> brand = brands.get(i);
                    botResponse.append(i + 1).append(". ").append(brand.get("name")).append("\n");
                }
                botResponse.append("Bạn muốn xem sản phẩm của thương hiệu nào? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                return;
            }

            // Kiểm tra nếu tin nhắn khớp với trigger "tìm sản phẩm theo nhóm hương"
            if (userMessage.equals(TRIGGER_BY_FRAGRANCE)) {
                List<Map<String, Object>> groups = chatService.getAllFragranceGroups();
                if (groups.isEmpty()) {
                    String botResponse = "Hiện tại không có nhóm hương nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                StringBuilder botResponse = new StringBuilder("Danh sách nhóm hương:\n");
                for (int i = 0; i < groups.size(); i++) {
                    Map<String, Object> group = groups.get(i);
                    botResponse.append(i + 1).append(". ").append(group.get("name")).append("\n");
                }
                botResponse.append("Bạn muốn xem sản phẩm thuộc nhóm hương nào? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                return;
            }

            // Kiểm tra xem người dùng có đang trong quá trình hỏi về sản phẩm không
            List<ChatMessage> recentMessages = chatService.getMessagesForUser(senderId, adminStaffIds);
            boolean isAskingProductName = recentMessages.stream()
                    .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID))
                    .anyMatch(msg -> msg.getContent().equals("Bạn cần tư vấn về sản phẩm nào ạ? Mời bạn nhập tên sản phẩm."));

            if (isAskingProductName) {
                String productName = chatMessage.getContent().trim();
                List<Map<String, Object>> products = chatService.searchProductsByName(productName);

                if (products.isEmpty()) {
                    String botResponse = "Rất tiếc, cửa hàng hiện không có sản phẩm này. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                StringBuilder botResponse = new StringBuilder("Cửa hàng hiện có các sản phẩm:\n");
                for (int i = 0; i < products.size(); i++) {
                    Map<String, Object> product = products.get(i);
                    botResponse.append(i + 1).append(". ").append(product.get("name")).append("\n");
                }
                botResponse.append("Bạn muốn hỏi về sản phẩm nào ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                return;
            }

            // Kiểm tra xem người dùng có đang chọn thương hiệu không
            boolean isSelectingBrand = recentMessages.stream()
                    .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID))
                    .anyMatch(msg -> msg.getContent().contains("Bạn muốn xem sản phẩm của thương hiệu nào?"));

            if (isSelectingBrand) {
                try {
                    int selectedIndex = Integer.parseInt(chatMessage.getContent().trim()) - 1;
                    List<Map<String, Object>> brands = chatService.getAllBrands();
                    if (selectedIndex < 0 || selectedIndex >= brands.size()) {
                        String botResponse = "Thương hiệu bạn chọn không hợp lệ. Vui lòng chọn lại. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    Integer brandId = (Integer) brands.get(selectedIndex).get("id");
                    List<Map<String, Object>> products = chatService.getProductsByBrand(brandId);

                    if (products.isEmpty()) {
                        String botResponse = "Thương hiệu này hiện không có sản phẩm nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    StringBuilder botResponse = new StringBuilder("Danh sách sản phẩm của thương hiệu " + brands.get(selectedIndex).get("name") + ":\n");
                    for (int i = 0; i < products.size(); i++) {
                        Map<String, Object> product = products.get(i);
                        botResponse.append(i + 1).append(". ").append(product.get("name")).append("\n");
                    }
                    botResponse.append("Bạn muốn hỏi về sản phẩm nào ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                    sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                    return;
                } catch (NumberFormatException e) {
                    String botResponse = "Vui lòng nhập số thứ tự thương hiệu hợp lệ. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }
            }

            // Kiểm tra xem người dùng có đang chọn nhóm hương không
            boolean isSelectingFragranceGroup = recentMessages.stream()
                    .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID))
                    .anyMatch(msg -> msg.getContent().contains("Bạn muốn xem sản phẩm thuộc nhóm hương nào?"));

            if (isSelectingFragranceGroup) {
                try {
                    int selectedIndex = Integer.parseInt(chatMessage.getContent().trim()) - 1;
                    List<Map<String, Object>> groups = chatService.getAllFragranceGroups();
                    if (selectedIndex < 0 || selectedIndex >= groups.size()) {
                        String botResponse = "Nhóm hương bạn chọn không hợp lệ. Vui lòng chọn lại. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    Integer groupId = (Integer) groups.get(selectedIndex).get("id");
                    List<Map<String, Object>> products = chatService.getProductsByFragranceGroup(groupId);

                    if (products.isEmpty()) {
                        String botResponse = "Nhóm hương này hiện không có sản phẩm nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    StringBuilder botResponse = new StringBuilder("Danh sách sản phẩm thuộc nhóm hương " + groups.get(selectedIndex).get("name") + ":\n");
                    for (int i = 0; i < products.size(); i++) {
                        Map<String, Object> product = products.get(i);
                        botResponse.append(i + 1).append(". ").append(product.get("name")).append("\n");
                    }
                    botResponse.append("Bạn muốn hỏi về sản phẩm nào ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')");
                    sendBotResponse(senderId, adminsAndStaff, botResponse.toString());
                    return;
                } catch (NumberFormatException e) {
                    String botResponse = "Vui lòng nhập số thứ tự nhóm hương hợp lệ. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }
            }

            // Kiểm tra xem người dùng có đang chọn sản phẩm từ danh sách không
            boolean isAskingProductChoice = recentMessages.stream()
                    .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID))
                    .anyMatch(msg -> msg.getContent().contains("Bạn muốn hỏi về sản phẩm nào ạ?"));

            if (isAskingProductChoice) {
                try {
                    int selectedIndex = Integer.parseInt(chatMessage.getContent().trim()) - 1;
                    ChatMessage lastBotMessage = recentMessages.stream()
                            .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID) && msg.getContent().contains("Bạn muốn hỏi về sản phẩm nào ạ?"))
                            .reduce((first, second) -> second)
                            .orElse(null);

                    if (lastBotMessage == null) {
                        String botResponse = "Không tìm thấy danh sách sản phẩm. Vui lòng bắt đầu lại.";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    String lastBotContent = lastBotMessage.getContent();
                    List<Map<String, Object>> products;
                    if (lastBotContent.contains("Danh sách 10 sản phẩm bán chạy nhất")) {
                        products = chatService.getTop10Products();
                    } else if (lastBotContent.contains("Danh sách sản phẩm của thương hiệu")) {
                        String brandName = lastBotContent.split("Danh sách sản phẩm của thương hiệu ")[1].split(":")[0];
                        Integer brandId = chatService.getAllBrands().stream()
                                .filter(b -> b.get("name").equals(brandName))
                                .map(b -> (Integer) b.get("id"))
                                .findFirst()
                                .orElse(null);
                        products = brandId != null ? chatService.getProductsByBrand(brandId) : List.of();
                    } else if (lastBotContent.contains("Danh sách sản phẩm thuộc nhóm hương")) {
                        String groupName = lastBotContent.split("Danh sách sản phẩm thuộc nhóm hương ")[1].split(":")[0];
                        Integer groupId = chatService.getAllFragranceGroups().stream()
                                .filter(g -> g.get("name").equals(groupName))
                                .map(g -> (Integer) g.get("id"))
                                .findFirst()
                                .orElse(null);
                        products = groupId != null ? chatService.getProductsByFragranceGroup(groupId) : List.of();
                    } else {
                        String productName = recentMessages.stream()
                                .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(senderId))
                                .filter(msg -> recentMessages.indexOf(msg) > recentMessages.indexOf(lastBotMessage))
                                .findFirst()
                                .map(ChatMessage::getContent)
                                .orElse("");
                        products = chatService.searchProductsByName(productName);
                    }

                    if (selectedIndex < 0 || selectedIndex >= products.size()) {
                        String botResponse = "Sản phẩm bạn chọn không hợp lệ. Vui lòng chọn lại hoặc tìm sản phẩm khác. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                    }

                    Map<String, Object> selectedProductDetails = products.get(selectedIndex);
                    String botResponse = "Bạn muốn biết thông tin gì về " + selectedProductDetails.get("name") + "?\n" +
                            "- Số lượng tồn kho\n" +
                            "- Dung tích\n" +
                            "- Giá\n" +
                            "- Mô tả\n" +
                            "- Hương đầu, giữa, cuối\n" +
                            "- Nồng độ\n" +
                            "- Hình ảnh\n" +
                            "Vui lòng chọn hoặc ghi rõ yêu cầu nhé! (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                } catch (NumberFormatException e) {
                    String botResponse = "Vui lòng nhập số thứ tự sản phẩm hợp lệ. (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }
            }

            // Kiểm tra xem người dùng có đang chọn thông tin chi tiết không
            boolean isAskingProductDetails = recentMessages.stream()
                    .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID))
                    .anyMatch(msg -> msg.getContent().contains("Vui lòng chọn hoặc ghi rõ yêu cầu nhé!"));

            if (isAskingProductDetails) {
                String infoType = chatMessage.getContent().toLowerCase().trim();
                String mappedInfoType;
                switch (infoType) {
                    case "số lượng tồn kho":
                        mappedInfoType = "stock";
                        break;
                    case "dung tích":
                        mappedInfoType = "volume";
                        break;
                    case "giá":
                        mappedInfoType = "price";
                        break;
                    case "mô tả":
                        mappedInfoType = "description";
                        break;
                    case "hương đầu":
                        mappedInfoType = "top_notes";
                        break;
                    case "hương giữa":
                        mappedInfoType = "middle_notes";
                        break;
                    case "hương cuối":
                        mappedInfoType = "base_notes";
                        break;
                    case "nồng độ":
                        mappedInfoType = "concentration";
                        break;
                    case "hình ảnh":
                        mappedInfoType = "images";
                        break;
                    default:
                        String botResponse = "Yêu cầu không hợp lệ. Vui lòng chọn lại từ danh sách:\n" +
                                "- Số lượng tồn kho\n" +
                                "- Dung tích\n" +
                                "- Giá\n" +
                                "- Mô tả\n" +
                                "- Hương đầu, giữa, cuối\n" +
                                "- Nồng độ\n" +
                                "- Hình ảnh\n" +
                                "(Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                        sendBotResponse(senderId, adminsAndStaff, botResponse);
                        return;
                }

                ChatMessage productChoiceMessage = recentMessages.stream()
                        .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(BOT_SENDER_ID) && msg.getContent().contains("Bạn muốn hỏi về sản phẩm nào ạ?"))
                        .reduce((first, second) -> second)
                        .orElse(null);
                if (productChoiceMessage == null) {
                    String botResponse = "Không tìm thấy sản phẩm bạn đã chọn. Vui lòng bắt đầu lại.";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                ChatMessage userProductSelection = recentMessages.stream()
                        .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(senderId))
                        .filter(msg -> recentMessages.indexOf(msg) > recentMessages.indexOf(productChoiceMessage))
                        .findFirst()
                        .orElse(null);
                if (userProductSelection == null) {
                    String botResponse = "Không tìm thấy sản phẩm bạn đã chọn. Vui lòng bắt đầu lại.";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                String selectedProductIndex = userProductSelection.getContent().trim();
                List<Map<String, Object>> products;
                String lastBotContent = productChoiceMessage.getContent();
                if (lastBotContent.contains("Danh sách 10 sản phẩm bán chạy nhất")) {
                    products = chatService.getTop10Products();
                } else if (lastBotContent.contains("Danh sách sản phẩm của thương hiệu")) {
                    String brandName = lastBotContent.split("Danh sách sản phẩm của thương hiệu ")[1].split(":")[0];
                    Integer brandId = chatService.getAllBrands().stream()
                            .filter(b -> b.get("name").equals(brandName))
                            .map(b -> (Integer) b.get("id"))
                            .findFirst()
                            .orElse(null);
                    products = brandId != null ? chatService.getProductsByBrand(brandId) : List.of();
                } else if (lastBotContent.contains("Danh sách sản phẩm thuộc nhóm hương")) {
                    String groupName = lastBotContent.split("Danh sách sản phẩm thuộc nhóm hương ")[1].split(":")[0];
                    Integer groupId = chatService.getAllFragranceGroups().stream()
                            .filter(g -> g.get("name").equals(groupName))
                            .map(g -> (Integer) g.get("id"))
                            .findFirst()
                            .orElse(null);
                    products = groupId != null ? chatService.getProductsByFragranceGroup(groupId) : List.of();
                } else {
                    String productName = recentMessages.stream()
                            .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(senderId))
                            .filter(msg -> recentMessages.indexOf(msg) < recentMessages.indexOf(productChoiceMessage))
                            .reduce((first, second) -> second)
                            .map(ChatMessage::getContent)
                            .orElse("");
                    products = chatService.searchProductsByName(productName);
                }

                int selectedIndex;
                try {
                    selectedIndex = Integer.parseInt(selectedProductIndex) - 1;
                } catch (NumberFormatException e) {
                    String botResponse = "Số thứ tự sản phẩm không hợp lệ. Vui lòng bắt đầu lại.";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                if (selectedIndex < 0 || selectedIndex >= products.size()) {
                    String botResponse = "Sản phẩm bạn chọn không hợp lệ. Vui lòng bắt đầu lại.";
                    sendBotResponse(senderId, adminsAndStaff, botResponse);
                    return;
                }

                Integer productId = (Integer) products.get(selectedIndex).get("id");
                Map<String, Object> productDetails = chatService.getProductDetails(productId, mappedInfoType);

                String botResponse = "Thông tin về " + productDetails.get("productName") + ":\n";
                switch (mappedInfoType) {
                    case "price":
                        botResponse += "Giá: " + productDetails.get("price") + " VNĐ";
                        break;
                    case "stock":
                        botResponse += "Số lượng tồn kho: " + productDetails.get("stock");
                        break;
                    case "volume":
                        botResponse += "Dung tích: " + productDetails.get("volume") + " ml";
                        break;
                    case "description":
                        botResponse += "Mô tả: " + productDetails.get("description");
                        break;
                    case "top_notes":
                        botResponse += "Hương đầu: " + productDetails.get("topNotes");
                        break;
                    case "middle_notes":
                        botResponse += "Hương giữa: " + productDetails.get("middleNotes");
                        break;
                    case "base_notes":
                        botResponse += "Hương cuối: " + productDetails.get("baseNotes");
                        break;
                    case "concentration":
                        botResponse += "Nồng độ: " + productDetails.get("concentration");
                        break;
                    case "images":
                        botResponse += "Hình ảnh: " + productDetails.get("images");
                        break;
                }
                botResponse += "\nBạn có muốn biết thêm thông tin khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập 'admin')";
                sendBotResponse(senderId, adminsAndStaff, botResponse);
                return;
            }
        }

        // Nếu đang trò chuyện với admin, gửi tin nhắn đến admin/staff
        for (TaiKhoan admin : adminsAndStaff) {
            Integer adminId = admin.getId();
            ChatMessage savedMessage = chatService.saveMessage(senderId, adminId, chatMessage.getContent());
            savedMessage.setSender(sender);
            savedMessage.setReceiver(admin);

            messagingTemplate.convertAndSend("/topic/admin-messages/" + adminId, savedMessage);
            messagingTemplate.convertAndSend("/topic/messages/" + senderId, savedMessage);
        }
    }

    // Phương thức gửi phản hồi từ bot
    private void sendBotResponse(Integer userId, List<TaiKhoan> adminsAndStaff, String botResponse) {
        for (TaiKhoan admin : adminsAndStaff) {
            Integer adminId = admin.getId();
            ChatMessage botMessage = chatService.saveMessage(BOT_SENDER_ID, userId, botResponse);

            TaiKhoan botSender = new TaiKhoan();
            botSender.setId(BOT_SENDER_ID);
            botSender.setTenDangNhap("Bot");
            botMessage.setSender(botSender);

            TaiKhoan receiver = taiKhoanRepository.findById(userId).orElse(null);
            botMessage.setReceiver(receiver);

            messagingTemplate.convertAndSend("/topic/messages/" + userId, botMessage);
            System.out.println("[ChatController] Bot đã gửi tin nhắn đến user qua /topic/messages/" + userId + ": " + botResponse);

            messagingTemplate.convertAndSend("/topic/admin-messages/" + adminId, botMessage);
            System.out.println("[ChatController] Bot đã gửi tin nhắn đến admin qua /topic/admin-messages/" + adminId + ": " + botResponse);
        }
    }

    @GetMapping("/messages/{user1Id}/{user2Id}")
    public List<ChatMessage> getMessages(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
        return chatService.getMessagesBetweenUsers(user1Id, user2Id);
    }

    @PostMapping("/recall/{messageId}")
    public ResponseEntity<Map<String, Object>> recallMessage(
            @PathVariable Long messageId,
            @RequestParam Integer userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            ChatMessage message = chatService.findById(messageId);
            if (message == null) {
                response.put("success", false);
                response.put("message", "Tin nhắn không tồn tại.");
                return ResponseEntity.badRequest().body(response);
            }

            TaiKhoan sender = message.getSender();
            if (sender == null || sender.getId() == null) {
                response.put("success", false);
                response.put("message", "Thông tin người gửi không hợp lệ.");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("Sender ID: {}, User ID: {}", sender.getId(), userId);

            if (!sender.getId().equals(userId)) {
                response.put("success", false);
                response.put("message", "Bạn không có quyền thu hồi tin nhắn này.");
                return ResponseEntity.status(403).body(response);
            }

            LocalDateTime messageTime = message.getTimestamp();
            if (messageTime == null) {
                response.put("success", false);
                response.put("message", "Thời gian tin nhắn không hợp lệ.");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDateTime now = LocalDateTime.now();
            if (messageTime.plusMinutes(2).isBefore(now)) {
                response.put("success", false);
                response.put("message", "Đã quá thời gian cho phép để thu hồi tin nhắn (2 phút).");
                return ResponseEntity.badRequest().body(response);
            }

            message.setRecalled(true);
            message.setContent("[Tin nhắn đã được thu hồi]");
            chatService.save(message);

            TaiKhoan receiver = message.getReceiver();
            if (receiver != null && receiver.getId() != null) {
                messagingTemplate.convertAndSend("/topic/messages/" + receiver.getId(), message);
            }
            messagingTemplate.convertAndSend("/topic/messages/" + sender.getId(), message);

            response.put("success", true);
            response.put("message", "Thu hồi tin nhắn thành công.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi khi thu hồi tin nhắn: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Lỗi khi thu hồi tin nhắn: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
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