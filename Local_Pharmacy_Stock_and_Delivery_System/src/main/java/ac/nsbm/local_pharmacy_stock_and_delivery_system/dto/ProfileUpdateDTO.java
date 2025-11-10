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
    private String dateOfBirth;


    private String bloodGroup;
    private String allergies;
    private String medicalConditions;


    private String vehicleType;
    private String vehicleNumber;
    private String status;




    private String preferredLanguage;
    private String preferredCurrency;
    private Boolean preferredDarkMode;


    private Boolean notifyEmailOrder;
    private Boolean notifyEmailDelivery;
    private Boolean notifyEmailPromo;
    private Boolean notifyEmailReminders;


    private Boolean notifySmsStatus;
    private Boolean notifySmsDelivery;


    private Boolean privacyDataCollection;
    private Boolean privacyShareHealth;
    private Boolean privacyMarketing;
}
