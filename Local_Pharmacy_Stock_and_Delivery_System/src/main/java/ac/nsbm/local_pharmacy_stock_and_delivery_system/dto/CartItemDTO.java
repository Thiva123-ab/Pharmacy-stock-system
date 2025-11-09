package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;

/**
 * Represents a single item in the shopping cart sent from the frontend.
 */
@Data
public class CartItemDTO {
    private Long medicineId;
    private Integer quantity;
}
