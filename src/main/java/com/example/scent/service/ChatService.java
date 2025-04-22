package com.example.scent.service;

import com.example.scent.entity.*;
import com.example.scent.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {
@Autowired
private SpctInterface spctInterface;
    @Autowired
    private ChatMessageInterface chatMessageRepository;

    @Autowired
    private TaiKhoanInterface taiKhoanRepository;
@Autowired
private SanPhamInterface sanPhamRepository;
@Autowired
private HinhAnhInterface hinhAnhInterface;
@Autowired
private DanhGiaInterface danhGiaInterface;
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
        // Lấy tất cả tin nhắn mà user gửi (bao gồm cả tin nhắn gửi cho tất cả admin/staff với receiverId = null)
        List<ChatMessage> sentMessages = chatMessageRepository.findBySenderId(userId);

        // Lấy tin nhắn user nhận (receiverId = userId)
        List<ChatMessage> receivedMessages = chatMessageRepository.findByReceiverId(userId);

        // Kết hợp tất cả tin nhắn
        List<ChatMessage> messages = new ArrayList<>();
        messages.addAll(sentMessages);
        messages.addAll(receivedMessages);

        // Gộp tin nhắn trùng lặp dựa trên content, senderId và timestamp (làm tròn đến giây)
        Map<String, ChatMessage> uniqueMessages = new HashMap<>();
        for (ChatMessage msg : messages) {
            // Làm tròn timestamp đến giây
            LocalDateTime timestamp = msg.getTimestamp().truncatedTo(ChronoUnit.SECONDS);
            String key = msg.getContent() + "-" + msg.getSender().getId() + "-" + timestamp.toString();

            // Chỉ giữ bản ghi đầu tiên cho mỗi khóa duy nhất
            uniqueMessages.putIfAbsent(key, msg);
        }

        // Chuyển về danh sách và sắp xếp theo timestamp
        return uniqueMessages.values().stream()
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());
    }
    public ChatMessage save(ChatMessage message) {
        return chatMessageRepository.save(message);
    }
    public ChatMessage findById(Long messageId) {
        return chatMessageRepository.findById(messageId).orElse(null);
    }
    public List<TaiKhoan> getUsersWithMessages(Integer adminId) {
        List<ChatMessage> messages = chatMessageRepository.findBySenderIdOrReceiverId(adminId, adminId);
        Set<Integer> userIds = messages.stream()
                .map(msg -> msg.getSender().getId().equals(adminId) ? msg.getReceiver().getId() : msg.getSender().getId())
                .collect(Collectors.toSet());
        return taiKhoanRepository.findByIdIn(new ArrayList<>(userIds));
    }


    public List<Map<String, Object>> searchProductsByName(String name) {
        List<SanPham> products = sanPhamRepository.searchByTenSanPham(name);
        return products.stream().map(p -> {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", p.getIdSanPham());
            productInfo.put("name", p.getTenSanPham());

            // Lấy thương hiệu
            productInfo.put("brand", p.getThuongHieu() != null ? p.getThuongHieu().getTenThuongHieu() : "Không có");

            // Lấy nhóm hương
            productInfo.put("fragranceGroup", p.getNhomHuong() != null ? p.getNhomHuong().getTenNhomHuong() : "Không có");

            // Lấy hình ảnh
            List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamIdSanPham(p.getIdSanPham());
            if (!hinhAnhs.isEmpty()) {
                productInfo.put("image", hinhAnhs.get(0).getLink());
            } else {
                productInfo.put("image", "https://example.com/default-image.jpg");
            }

            // Lấy đánh giá tốt nhất
            List<DanhGia> danhGias = danhGiaInterface.findTopRatedBySanPham_IdSanPham(p.getIdSanPham());
            if (!danhGias.isEmpty()) {
                DanhGia topDanhGia = danhGias.get(0);
                Map<String, Object> topReview = new HashMap<>();
                topReview.put("rating", topDanhGia.getRating());
                topReview.put("content", topDanhGia.getComment());
                productInfo.put("topReview", topReview);
            } else {
                productInfo.put("topReview", null);
            }

            return productInfo;
        }).collect(Collectors.toList());
    }

    // Lấy thông tin chi tiết của sản phẩm (giữ nguyên như trước)
    public Map<String, Object> getProductDetails(Integer productId, String infoType) {
        SanPham sanPham = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));
        List<Spct> spcts = spctInterface.findByidSanPham(productId);
        List<HinhAnh> hinhAnhs = hinhAnhInterface.findHinhAnhBySanPhamId(productId);

        Map<String, Object> details = new HashMap<>();
        details.put("productName", sanPham.getTenSanPham());

        switch (infoType.toLowerCase()) {
            case "volume_price": // Thêm case mới để trả về danh sách dung tích-giá
                if (!spcts.isEmpty()) {
                    List<Map<String, Object>> volumePriceList = spcts.stream().map(spct -> {
                        Map<String, Object> volumePrice = new HashMap<>();
                        volumePrice.put("volume", spct.getDungTich() != null ? spct.getDungTich() : "Không có");
                        volumePrice.put("price", spct.getDonGia() != null ? spct.getDonGia() : "Không có");
                        return volumePrice;
                    }).collect(Collectors.toList());
                    details.put("volumePriceList", volumePriceList);
                } else {
                    details.put("volumePriceList", List.of());
                }
                break;
            case "price":
                if (!spcts.isEmpty()) {
                    details.put("price", spcts.get(0).getDonGia());
                } else {
                    details.put("price", "Không có thông tin giá");
                }
                break;
            case "stock":
                if (!spcts.isEmpty()) {
                    details.put("stock", spcts.get(0).getSoLuongTonKho());
                } else {
                    details.put("stock", "Không có thông tin tồn kho");
                }
                break;
            case "volume":
                if (!spcts.isEmpty()) {
                    details.put("volume", spcts.get(0).getDungTich());
                } else {
                    details.put("volume", "Không có thông tin dung tích");
                }
                break;
            case "description":
                details.put("description", sanPham.getMoTaSanPham());
                break;
            case "top_notes":
                details.put("topNotes", sanPham.getHuongDau() != null ? sanPham.getHuongDau().getMoTaHuongDau() : "Không có");
                break;
            case "middle_notes":
                details.put("middleNotes", sanPham.getHuongGiua() != null ? sanPham.getHuongGiua().getMoTaHuongGiua() : "Không có");
                break;
            case "base_notes":
                details.put("baseNotes", sanPham.getHuongCuoi() != null ? sanPham.getHuongCuoi().getMoTaHuongCuoi() : "Không có");
                break;
            case "concentration":
                details.put("concentration", sanPham.getNongDo() != null ? sanPham.getNongDo().getTenNongDo() : "Không có");
                break;
            case "images":
                if (!hinhAnhs.isEmpty()) {
                    details.put("images", hinhAnhs.stream().map(HinhAnh::getLink).collect(Collectors.toList()));
                } else {
                    details.put("images", List.of());
                }
                break;
            default:
                throw new RuntimeException("Loại thông tin không hợp lệ: " + infoType);
        }
        return details;
    }
}