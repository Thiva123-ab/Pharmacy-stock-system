package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Medicine medicine;

    private Integer changeQty; // positive or negative

    private String note;

    private LocalDateTime changeAt = LocalDateTime.now();

    @ManyToOne
    private AppUser changedBy;
}
