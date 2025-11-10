package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;
    private String username;
    private String action;
    private String resource;
    private String ipAddress;
    private String status;

    // Constructor to make logging easier
    public AuditLog(String username, String action, String resource, String status) {
        this.timestamp = LocalDateTime.now();
        this.username = username;
        this.action = action;
        this.resource = resource;
        this.status = status;
        this.ipAddress = "127.0.0.1";
    }
}