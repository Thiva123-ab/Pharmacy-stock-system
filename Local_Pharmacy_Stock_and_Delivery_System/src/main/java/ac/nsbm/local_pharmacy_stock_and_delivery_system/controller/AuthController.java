package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.config.MockJwtService;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.LoginDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.RegisterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final MockJwtService mockJwtService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, MockJwtService mockJwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.mockJwtService = mockJwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        AppUser u = userService.register(dto.getName(), dto.getEmail(), dto.getPassword(), dto.getRole());

        String token = mockJwtService.generateToken(u.getEmail());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful",
                "token", token,
                "user", Map.of(
                        "id", u.getId(),
                        "firstName", u.getName(), // Frontend uses 'firstName'
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                )));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
        Authentication auth = authenticationManager.authenticate(token);
        SecurityContextHolder.getContext().setAuthentication(auth);

        AppUser u = userService.findByEmail(dto.getEmail());
        String jwtToken = mockJwtService.generateToken(u.getEmail());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful",
                "token", jwtToken,
                "user", Map.of(
                        "id", u.getId(),
                        "firstName", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                )));
    }
}