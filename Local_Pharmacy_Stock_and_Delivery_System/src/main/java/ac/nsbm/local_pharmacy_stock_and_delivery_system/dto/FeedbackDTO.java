package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;

// This is what the frontend sends when creating feedback
@Data
public class FeedbackDTO {
    private Integer rating;
    private String comment;
}