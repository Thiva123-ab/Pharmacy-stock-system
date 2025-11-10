package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.config.JwtService;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.LoginDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.RegisterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.AuditLogService;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService, AuditLogService auditLogService) { // <-- UPDATE CONSTRUCTOR
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        AppUser u = userService.register(
                dto.getFirstName(),
                dto.getLastName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getPassword(),
                dto.getRole()
        );

        UserDetails userDetails = User.withUsername(u.getEmail())
                .password(u.getPassword())
                .authorities(u.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);


        auditLogService.createLog(dto.getEmail(), "REGISTER", "User #" + u.getId(), "Success");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful",
                "token", token,
                "user", Map.of(
                        "id", u.getId(),
                        "firstName", u.getFirstName(),
                        "lastName", u.getLastName(),
                        "email", u.getEmail(),
                        "phone", u.getPhone(),
                        "role", u.getRole().name()
                )));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        try {
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
            Authentication auth = authenticationManager.authenticate(token);
            SecurityContextHolder.getContext().setAuthentication(auth);

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String jwtToken = jwtService.generateToken(userDetails);
            AppUser u = userService.findByEmail(dto.getEmail());


            auditLogService.createLog(dto.getEmail(), "LOGIN", "System", "Success");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "token", jwtToken,
                    "user", Map.of(
                            "id", u.getId(),
                            "firstName", u.getFirstName(),
                            "lastName", u.getLastName(),
                            "email", u.getEmail(),
                            "phone", u.getPhone(),
                            "role", u.getRole().name()
                    )));
        } catch (AuthenticationException e) {

            auditLogService.createLog(dto.getEmail(), "LOGIN", "System", "Failed");

            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid email or password"));
        }
    }
}