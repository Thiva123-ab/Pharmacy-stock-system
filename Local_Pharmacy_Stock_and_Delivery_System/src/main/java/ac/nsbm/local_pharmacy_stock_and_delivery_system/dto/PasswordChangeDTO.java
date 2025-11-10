package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeDTO {
    @NotBlank
    private String currentPassword;

    @NotBlank @Size(min = 6)
    private String newPassword;
}