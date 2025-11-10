package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference; // <-- IMPORT THIS
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @JsonBackReference
    @ManyToOne
    private Order order;

    @ManyToOne
    private Medicine medicine;

    private Integer quantity;
    private Double price;
}