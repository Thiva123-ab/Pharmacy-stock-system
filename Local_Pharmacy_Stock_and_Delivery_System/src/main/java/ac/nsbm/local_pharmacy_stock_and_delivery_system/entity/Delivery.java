package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Order order;

    @ManyToOne
    private AppUser driver;

    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String deliveryAddress;

    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private String deliveryNotes;

    private String status;

    private Double earnings;
    private Integer rating;
}