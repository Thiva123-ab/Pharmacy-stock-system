package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterDTO {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email @NotBlank
    private String email;


    @NotBlank
    private String phone;


    @NotBlank
    private String password;

    private Role role = Role.ROLE_CUSTOMER;
}