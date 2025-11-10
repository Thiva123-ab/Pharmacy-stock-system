package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.CustomerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerDashboardController {

    private final CustomerDashboardService dashboardService;

    public CustomerDashboardController(CustomerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        try {
            Map<String, Object> stats = dashboardService.getCustomerDashboardStats(email);
            return ResponseEntity.ok(Map.of("success", true, "data", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}