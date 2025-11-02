package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.PasswordChangeDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ProfileUpdateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // PUT /api/users/profile (Used by profile.js/settings.js)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

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
