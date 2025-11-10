package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.SystemSettingsDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.PharmacySettings;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.PharmacySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemSettingsService {

    private final PharmacySettingsRepository settingsRepository;

    public SystemSettingsService(PharmacySettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    /**
     * Gets the system settings.
     * There should only ever be ONE settings entry, which we'll identify by ID 1.
     * If it doesn't exist, this method creates a default one.
     */
    @Transactional
    public PharmacySettings getSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            PharmacySettings defaults = new PharmacySettings();
            defaults.setId(1L);
            defaults.setPharmacyName("PharmaCare");
            defaults.setSystemEmail("admin@pharmacare.com");
            defaults.setPhone("+94 11 234 5678");
            defaults.setTimezone("Asia/Colombo");
            defaults.setSmtpHost("smtp.gmail.com");
            defaults.setSmtpPort("587");
            defaults.setSmtpUsername("your-email@gmail.com");
            return settingsRepository.save(defaults);
        });
    }

    /**
     * Updates the system settings based on the DTO.
     * It only updates fields that are not null in the DTO,
     * allowing for partial updates (e.g., just General or just Email).
     */
    @Transactional
    public PharmacySettings updateSettings(SystemSettingsDTO dto) {
        PharmacySettings settings = getSettings(); // Get the single settings object (ID 1)

        // Update General Settings if present
        if (dto.getPharmacyName() != null) {
            settings.setPharmacyName(dto.getPharmacyName());
        }
        if (dto.getSystemEmail() != null) {
            settings.setSystemEmail(dto.getSystemEmail());
        }
        if (dto.getPhone() != null) {
            settings.setPhone(dto.getPhone());
        }
        if (dto.getTimezone() != null) {
            settings.setTimezone(dto.getTimezone());
        }

        // Update Email Settings if present
        if (dto.getSmtpHost() != null) {
            settings.setSmtpHost(dto.getSmtpHost());
        }
        if (dto.getSmtpPort() != null) {
            settings.setSmtpPort(dto.getSmtpPort());
        }
        if (dto.getSmtpUsername() != null) {
            settings.setSmtpUsername(dto.getSmtpUsername());
        }
        // Only update password if a new one is provided and it's not empty
        if (dto.getSmtpPassword() != null && !dto.getSmtpPassword().isBlank()) {
            // In a real app, you would encrypt this password!
            settings.setSmtpPassword(dto.getSmtpPassword());
        }

        return settingsRepository.save(settings);
    }
}