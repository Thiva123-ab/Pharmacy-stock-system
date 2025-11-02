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
    private String name; // Used for First Name + Last Name concatenation

    // Fields used for Customer Profile / Customer Management
    private String phone;
    private String address;
    private String dateOfBirth; //
    private String status; //
    private Integer totalOrders = 0; // Used for customer stats

    // Fields primarily used for Delivery Person
    private String vehicleType;
    private String vehicleNumber;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    public @NotBlank String getFirstName(){
        return this.name;
    }

    public @NotBlank String getLastName()
    {
        return this.name;
    }
}