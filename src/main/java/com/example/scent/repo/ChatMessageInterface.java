package com.example.scent.repo;

import com.example.scent.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageInterface extends JpaRepository<ChatMessage,Long> {
//    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
//            Integer senderId, Integer receiverId, Integer receiverId2, Integer senderId2);
List<ChatMessage> findBySenderIdAndReceiverIdIsNull(Integer senderId);
    List<ChatMessage> findByReceiverId(Integer receiverId);
    List<ChatMessage> findBySenderId(Integer senderId);
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            Integer senderId, Integer receiverId,
            Integer receiverId2, Integer senderId2
    );

    List<ChatMessage> findBySenderIdAndReceiverIdInOrReceiverIdAndSenderIdIn(
            Integer senderId, List<Integer> receiverIds,
            Integer receiverId, List<Integer> senderIds
    );

    List<ChatMessage> findBySenderIdOrReceiverId(Integer senderId, Integer receiverId);
}
