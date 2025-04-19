package com.example.scent.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "is_recalled", nullable = false)
    private Boolean isRecalled = false;

    public Boolean getRecalled() {
        return isRecalled;
    }

    public void setRecalled(Boolean recalled) {
        isRecalled = recalled;
    }

    @ManyToOne
    @JoinColumn(name = "sender_id", referencedColumnName = "id")
    private TaiKhoan sender; // Người gửi (user, staff, hoặc admin)

    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "id")
    private TaiKhoan receiver; // Người nhận (user, staff, hoặc admin)

    @Column(name = "content")
    private String content; // Nội dung tin nhắn

    @Column(name = "timestamp")
    private LocalDateTime timestamp; // Thời gian gửi

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaiKhoan getSender() { return sender; }
    public void setSender(TaiKhoan sender) { this.sender = sender; }
    public TaiKhoan getReceiver() { return receiver; }
    public void setReceiver(TaiKhoan receiver) { this.receiver = receiver; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}