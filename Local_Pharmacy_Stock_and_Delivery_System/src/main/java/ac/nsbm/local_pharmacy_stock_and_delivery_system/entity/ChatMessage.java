
package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id")
    private AppUser sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String chatType;


    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
    // --- END: CORRECTION ---

    private LocalDateTime timestamp = LocalDateTime.now();

    public ChatMessage(Order order, AppUser sender, String content, String chatType) {
        this.order = order;
        this.sender = sender;
        this.content = content;
        this.chatType = chatType;
        this.isRead = false;
    }
}