package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String firstName;
    private String lastName;
    @Email
    private String email;
    private String phone;
    private String address;
    private String vehicleType;
    private String vehicleNumber;
    private String status;
    private String dateOfBirth;
}
