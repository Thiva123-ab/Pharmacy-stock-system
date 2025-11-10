package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.SystemSettingsDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.PharmacySettings;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.SystemSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ADMIN')")
public class SystemSettingsController {

    private final SystemSettingsService settingsService;

    public SystemSettingsController(SystemSettingsService settingsService) {
        this.settingsService = settingsService;
    }


    @GetMapping
    public ResponseEntity<?> getSystemSettings() {
        PharmacySettings settings = settingsService.getSettings();
        return ResponseEntity.ok(Map.of("success", true, "data", settings));
    }


    @PutMapping
    public ResponseEntity<?> updateSystemSettings(@RequestBody SystemSettingsDTO settingsDTO) {
        try {
            settingsService.updateSettings(settingsDTO);
            return ResponseEntity.ok(Map.of("success", true, "message", "Settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}