package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.LoginDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.RegisterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
        AppUser u = userService.register(dto.getName(), dto.getEmail(), dto.getPassword(), dto.getRole());
        return ResponseEntity.ok(Map.of("id", u.getId(), "email", u.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword());
        Authentication auth = authenticationManager.authenticate(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.getSession(true);
        return ResponseEntity.ok(Map.of("message", "Logged in"));
    }

    // a simple endpoint to return CSRF token (optionally used by frontend)
    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        return Map.of("token", token.getToken());
    }
}
