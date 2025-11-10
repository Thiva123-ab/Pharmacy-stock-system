package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private String content;
    private Long orderId;
    private String chatType; // --- ADDED THIS FIELD ---
}
