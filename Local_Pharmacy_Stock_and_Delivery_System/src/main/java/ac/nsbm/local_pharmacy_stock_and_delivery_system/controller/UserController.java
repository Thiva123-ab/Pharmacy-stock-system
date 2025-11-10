package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.PasswordChangeDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ProfileUpdateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.RegisterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
// --- ADD THIS IMPORT ---
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --- START: NEW ENDPOINT TO GET DRIVERS ---
    @GetMapping("/drivers")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<?> getDeliveryDrivers() {
        List<AppUser> allUsers = userService.getAllUsers();

        // Filter for only users with the DELIVERY role
        List<Map<String, Object>> drivers = allUsers.stream()
                .filter(user -> user.getRole() == Role.ROLE_DELIVERY && "ACTIVE".equals(user.getStatus()))
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    userMap.put("email", user.getEmail());
                    userMap.put("phone", user.getPhone() != null ? user.getPhone() : "N/A");
                    userMap.put("vehicleType", user.getVehicleType() != null ? user.getVehicleType() : "N/A");
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", drivers));
    }
    // --- END: NEW ENDPOINT ---

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<AppUser> users = userService.getAllUsers();

        List<Map<String, Object>> userResponses = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    userMap.put("email", user.getEmail());
                    userMap.put("phone", user.getPhone() != null ? user.getPhone() : "N/A");
                    userMap.put("role", user.getRole().name());
                    userMap.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", userResponses));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody RegisterDTO dto) {
        AppUser u = userService.register(
                dto.getFirstName(),
                dto.getLastName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getPassword(),
                dto.getRole()
        );

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", u.getId());
        userMap.put("firstName", u.getFirstName());
        userMap.put("lastName", u.getLastName());
        userMap.put("email", u.getEmail());
        userMap.put("phone", u.getPhone());
        userMap.put("role", u.getRole().name());
        userMap.put("status", u.getStatus() != null ? u.getStatus() : "ACTIVE");

        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "User created successfully",
                "user", userMap
        ));
    }


    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterDTO dto) {
        try {
            AppUser updatedUser = userService.updateUser(id, dto);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", updatedUser.getId());
            userMap.put("firstName", updatedUser.getFirstName());
            userMap.put("lastName", updatedUser.getLastName());
            userMap.put("email", updatedUser.getEmail());
            userMap.put("phone", updatedUser.getPhone());
            userMap.put("role", updatedUser.getRole().name());
            userMap.put("status", updatedUser.getStatus());

            return ResponseEntity.ok(Map.of("success", true, "message", "User updated successfully", "user", userMap));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    @PutMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = auth.getName();
        String newStatus = payload.get("status");

        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "New status is required."));
        }

        try {
            userService.updateUserStatus(id, newStatus, adminEmail);
            return ResponseEntity.ok(Map.of("success", true, "message", "User status updated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = auth.getName();

        try {
            userService.deleteUser(id, adminEmail);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // --- NEW: DELETE /profile ENDPOINT ---
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteOwnProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        try {
            userService.deleteOwnAccount(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Account deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    // --- END: NEW ENDPOINT ---

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        // The service now accepts all new fields from the DTO
        userService.updateProfile(email, dto);

        return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        userService.changePassword(email, dto.getCurrentPassword(), dto.getNewPassword());

        return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestBody Map<String, String> avatarData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        userService.updateAvatar(email, avatarData.get("avatar"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Avatar updated"));
    }
}