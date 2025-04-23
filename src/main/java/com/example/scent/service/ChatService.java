package com.example.scent.service;

import com.example.scent.entity.*;
import com.example.scent.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    @Autowired
    private ThuongHieuInterface thuongHieuInterface;
    @Autowired
    private NhomHuongInterface nhomHuongInterface;
    @Autowired
    private CTDHInterface ctDHInterface;

    private static final List<String> EXIT_KEYWORDS = Arrays.asList("admin", "thoát", "nói chuyện với admin", "người thật");

    public Integer createGuestUser() {
        TaiKhoan guest = new TaiKhoan();
        guest.setTenDangNhap("guest_" + System.currentTimeMillis());
        guest.setMatKhau(""); // Không cần mật khẩu
        guest.setVaiTro("GUEST");
        guest.setHoTen("Guest_" + System.currentTimeMillis());
        TaiKhoan savedGuest = taiKhoanRepository.save(guest);
        return savedGuest.getId();
    }

    // Kiểm tra xem khách hàng đã yêu cầu trò chuyện với admin hay chưa
    private boolean isChattingWithAdmin(Integer userId, List<Integer> adminStaffIds) {
        List<ChatMessage> userMessages = getMessagesForUser(userId, adminStaffIds);
        return userMessages.stream()
                .filter(msg -> msg.getSender() != null && msg.getSender().getId().equals(userId))
                .anyMatch(msg -> EXIT_KEYWORDS.stream().anyMatch(keyword -> msg.getContent().toLowerCase().trim().contains(keyword)));
    }

    public ChatMessage saveMessage(Integer senderId, Integer receiverId, String content) {
        TaiKhoan sender = taiKhoanRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderId));
        TaiKhoan receiver = receiverId != null ? taiKhoanRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + receiverId)) : null;

        // Lấy danh sách admin/staff để kiểm tra trạng thái
        List<TaiKhoan> adminsAndStaff = taiKhoanRepository.findByVaiTroIn(Arrays.asList("ADMIN", "STAFF"));
        List<Integer> adminStaffIds = adminsAndStaff.stream().map(TaiKhoan::getId).collect(Collectors.toList());

        // Kiểm tra trạng thái trò chuyện với admin
        boolean isChattingWithAdmin = isChattingWithAdmin(senderId, adminStaffIds) || EXIT_KEYWORDS.stream().anyMatch(keyword -> content.toLowerCase().trim().contains(keyword));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        // Chỉ lưu tin nhắn nếu khách hàng đã yêu cầu trò chuyện với admin
        if (isChattingWithAdmin) {
            ChatMessage savedMessage = chatMessageRepository.save(message);
            System.out.println("Message saved: " + savedMessage);
            return savedMessage;
        } else {
            // Trả về tin nhắn không lưu để gửi qua WebSocket mà không lưu vào DB
            System.out.println("Message not saved (not chatting with admin): " + message);
            return message;
        }
    }

    public List<ChatMessage> getMessagesBetweenUsers(Integer user1Id, Integer user2Id) {
        return chatMessageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(user1Id, user2Id, user1Id, user2Id);
    }

    public List<ChatMessage> getMessagesForUser(Integer userId, List<Integer> adminStaffIds) {
        List<ChatMessage> sentMessages = chatMessageRepository.findBySenderId(userId);
        List<ChatMessage> receivedMessages = chatMessageRepository.findByReceiverId(userId);
        List<ChatMessage> messages = new ArrayList<>();
        messages.addAll(sentMessages);
        messages.addAll(receivedMessages);

        Map<String, ChatMessage> uniqueMessages = new HashMap<>();
        for (ChatMessage msg : messages) {
            LocalDateTime timestamp = msg.getTimestamp().truncatedTo(ChronoUnit.SECONDS);
            String key = msg.getContent() + "-" + msg.getSender().getId() + "-" + timestamp.toString();
            uniqueMessages.putIfAbsent(key, msg);
        }

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
            productInfo.put("brand", p.getThuongHieu() != null ? p.getThuongHieu().getTenThuongHieu() : "Không có");
            productInfo.put("fragranceGroup", p.getNhomHuong() != null ? p.getNhomHuong().getTenNhomHuong() : "Không có");

            List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamIdSanPham(p.getIdSanPham());
            if (!hinhAnhs.isEmpty()) {
                productInfo.put("image", hinhAnhs.get(0).getLink());
            } else {
                productInfo.put("image", "https://example.com/default-image.jpg");
            }

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

    public List<Map<String, Object>> getTop10Products() {
        List<Object[]> results = sanPhamRepository.findTop10ByOrderBySoLuongBanDesc();

        return results.stream().map(result -> {
                    Map<String, Object> productInfo = new HashMap<>();
                    Integer productId = (Integer) result[0];
                    String productName = (String) result[1];

                    Optional<SanPham> sanPhamOpt = sanPhamRepository.findById(productId);
                    if (sanPhamOpt.isEmpty()) {
                        return null;
                    }
                    SanPham p = sanPhamOpt.get();

                    productInfo.put("id", p.getIdSanPham());
                    productInfo.put("name", p.getTenSanPham());
                    productInfo.put("brand", p.getThuongHieu() != null ? p.getThuongHieu().getTenThuongHieu() : "Không có");
                    productInfo.put("fragranceGroup", p.getNhomHuong() != null ? p.getNhomHuong().getTenNhomHuong() : "Không có");

                    List<ChiTietDonHang> chiTietDonHangs = ctDHInterface.findBySpctSanPhamIdSanPham(p.getIdSanPham());
                    long totalSold = chiTietDonHangs.stream()
                            .filter(ctdh -> ctdh.getDonHang() != null && ctdh.getDonHang().getTrangThai() == 4)
                            .mapToLong(ChiTietDonHang::getSoLuong)
                            .sum();
                    productInfo.put("totalSold", totalSold);

                    List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamIdSanPham(p.getIdSanPham());
                    if (!hinhAnhs.isEmpty()) {
                        productInfo.put("image", hinhAnhs.get(0).getLink());
                    } else {
                        productInfo.put("image", "https://example.com/default-image.jpg");
                    }

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
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllBrands() {
        List<ThuongHieu> brands = thuongHieuInterface.findAll();
        return brands.stream().map(b -> {
            Map<String, Object> brandInfo = new HashMap<>();
            brandInfo.put("id", b.getId());
            brandInfo.put("name", b.getTenThuongHieu());
            return brandInfo;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getProductsByBrand(Integer brandId) {
        List<SanPham> products = sanPhamRepository.findByThuongHieu_Id(brandId);
        return products.stream().map(p -> {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", p.getIdSanPham());
            productInfo.put("name", p.getTenSanPham());
            productInfo.put("brand", p.getThuongHieu() != null ? p.getThuongHieu().getTenThuongHieu() : "Không có");
            productInfo.put("fragranceGroup", p.getNhomHuong() != null ? p.getNhomHuong().getTenNhomHuong() : "Không có");

            List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamIdSanPham(p.getIdSanPham());
            if (!hinhAnhs.isEmpty()) {
                productInfo.put("image", hinhAnhs.get(0).getLink());
            } else {
                productInfo.put("image", "https://example.com/default-image.jpg");
            }

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

    public List<Map<String, Object>> getAllFragranceGroups() {
        List<NhomHuong> groups = nhomHuongInterface.findAll();
        return groups.stream().map(g -> {
            Map<String, Object> groupInfo = new HashMap<>();
            groupInfo.put("id", g.getId());
            groupInfo.put("name", g.getTenNhomHuong());
            return groupInfo;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getProductsByFragranceGroup(Integer groupId) {
        List<SanPham> products = sanPhamRepository.findByNhomHuong_Id(groupId);
        return products.stream().map(p -> {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", p.getIdSanPham());
            productInfo.put("name", p.getTenSanPham());
            productInfo.put("brand", p.getThuongHieu() != null ? p.getThuongHieu().getTenThuongHieu() : "Không có");
            productInfo.put("fragranceGroup", p.getNhomHuong() != null ? p.getNhomHuong().getTenNhomHuong() : "Không có");

            List<HinhAnh> hinhAnhs = hinhAnhInterface.findBySanPhamIdSanPham(p.getIdSanPham());
            if (!hinhAnhs.isEmpty()) {
                productInfo.put("image", hinhAnhs.get(0).getLink());
            } else {
                productInfo.put("image", "https://example.com/default-image.jpg");
            }

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

    public Map<String, Object> getProductDetails(Integer productId, String infoType) {
        SanPham sanPham = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));
        List<Spct> spcts = spctInterface.findByidSanPham(productId);
        List<HinhAnh> hinhAnhs = hinhAnhInterface.findHinhAnhBySanPhamId(productId);

        Map<String, Object> details = new HashMap<>();
        details.put("productName", sanPham.getTenSanPham());

        switch (infoType.toLowerCase()) {
            case "volume_price":
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