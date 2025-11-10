package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.Data;

// This DTO is used to transfer all system settings to and from the frontend
@Data
public class SystemSettingsDTO {
    // General Settings
    private String pharmacyName;
    private String systemEmail;
    private String phone;
    private String timezone;

    // Email Settings
    private String smtpHost;
    private String smtpPort;
    private String smtpUsername;
    private String smtpPassword;

    // Other settings from the entity (can be added later if needed)
    private String address;
    private String language;
    private String currency;
    private Boolean darkModeEnabled;
    private Boolean emailNotifications;
    private Boolean stockAlerts;
    private Boolean orderNotifications;
    private Boolean expiryAlerts;
}