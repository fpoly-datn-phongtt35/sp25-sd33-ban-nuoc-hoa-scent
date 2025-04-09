package com.example.scent.websocket;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendOrderUpdate(Long userId, String message) {
        messagingTemplate.convertAndSend("/topic/donhang/" + userId, message);
    }
}
