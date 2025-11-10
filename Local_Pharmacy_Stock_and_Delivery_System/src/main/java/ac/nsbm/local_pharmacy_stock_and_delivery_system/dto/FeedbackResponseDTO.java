package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Feedback;
import lombok.Data;
import java.time.LocalDateTime;

// This is what the backend sends to the frontend
@Data
public class FeedbackResponseDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private String customerName;
    private LocalDateTime createdAt;

    public static FeedbackResponseDTO fromEntity(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());

        // To protect privacy, we only send the customer's first name
        if (feedback.getCustomer() != null) {
            dto.setCustomerName(feedback.getCustomer().getFirstName());
        } else {
            dto.setCustomerName("Anonymous");
        }
        return dto;
    }
}