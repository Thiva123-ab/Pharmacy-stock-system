package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginDTO {
    @Email @NotBlank
    private String email;

    @NotBlank
    private String password;
}
