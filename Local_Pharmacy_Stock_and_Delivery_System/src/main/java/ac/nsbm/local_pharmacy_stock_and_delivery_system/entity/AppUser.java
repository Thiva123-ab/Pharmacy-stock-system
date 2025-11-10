package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String name;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;


    private String phone;
    private String address;
    private String dateOfBirth;
    private String status;
    private Integer totalOrders = 0;


    private String bloodGroup;
    private String allergies;
    private String medicalConditions;


    private String vehicleType;
    private String vehicleNumber;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role;




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