package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private AppUser recipient;

    @Column(nullable = false)
    private String message;

    private String link;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification(AppUser recipient, String message, String link) {
        this.recipient = recipient;
        this.message = message;
        this.link = link;
    }
}