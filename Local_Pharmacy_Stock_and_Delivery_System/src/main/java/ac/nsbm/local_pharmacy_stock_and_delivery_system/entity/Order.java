package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference; // <-- IMPORT THIS
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private AppUser customer;

    private String customerName;
    private String deliveryAddress;

    private Double totalAmount;

    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();


    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}