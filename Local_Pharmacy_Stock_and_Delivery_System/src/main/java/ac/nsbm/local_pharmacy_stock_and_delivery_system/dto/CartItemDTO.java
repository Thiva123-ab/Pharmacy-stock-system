package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;


@Data
public class CartItemDTO {
    private Long medicineId;
    private Integer quantity;
}
