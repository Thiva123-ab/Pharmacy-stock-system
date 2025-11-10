package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerCreateDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email @NotBlank
    private String email;

    private String phone;
    private String address;
    private String dateOfBirth;
    private String status = "ACTIVE";
}
