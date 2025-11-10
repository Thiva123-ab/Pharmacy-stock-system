package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.ChatMessage;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageResponseDTO {
    private Long id;
    private String content;
    private LocalDateTime timestamp;
    private Long senderId;
    private String senderName;
    private Role senderRole;
    private Long orderId;
    private String chatType;


    public static ChatMessageResponseDTO fromEntity(ChatMessage message) {
        ChatMessageResponseDTO dto = new ChatMessageResponseDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setOrderId(message.getOrder().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setSenderRole(message.getSender().getRole());
        dto.setChatType(message.getChatType());
        return dto;
    }
}
