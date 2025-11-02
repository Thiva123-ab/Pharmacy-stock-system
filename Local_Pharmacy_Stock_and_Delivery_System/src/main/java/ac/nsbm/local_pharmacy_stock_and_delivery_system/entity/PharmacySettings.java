package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pharmacy_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PharmacySettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pharmacyName;
    private String address;
    private String phone;
    private String license;

    private String language;
    private String timezone;
    private String currency;
    private Boolean darkModeEnabled;

    private Boolean emailNotifications;
    private Boolean stockAlerts;
    private Boolean orderNotifications;
    private Boolean expiryAlerts;
}