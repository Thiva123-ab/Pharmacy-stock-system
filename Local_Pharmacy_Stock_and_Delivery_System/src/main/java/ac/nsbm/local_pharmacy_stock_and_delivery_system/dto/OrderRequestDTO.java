package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;
import java.util.List;

/**
 * Represents the entire checkout request (the shopping cart).
 */
@Data
public class OrderRequestDTO {
    private List<CartItemDTO> items;
    // We can add deliveryAddress, paymentMethod, etc. here later
}