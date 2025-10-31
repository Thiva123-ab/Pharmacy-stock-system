package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String brand;
    private String genericName;

    @DecimalMin("0.0")
    private Double priceLKR;

    private Integer quantity;

    private String description;
}
