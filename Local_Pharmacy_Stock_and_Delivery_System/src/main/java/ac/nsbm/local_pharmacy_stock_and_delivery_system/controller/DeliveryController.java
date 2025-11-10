package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;


import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.DeliveryCreateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Order;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.DeliveryService;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;
    private final OrderService orderService;
    private final AppUserRepository appUserRepo;

    public DeliveryController(DeliveryService service, OrderService orderService, AppUserRepository appUserRepo) {
        this.service = service;
        this.orderService = orderService;
        this.appUserRepo = appUserRepo;
    }

    // GET method
    @GetMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Delivery> list = service.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }


    @GetMapping("/my-dashboard")
    @PreAuthorize("hasRole('DELIVERY')")
    public ResponseEntity<?> getMyDashboardData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        try {
            Map<String, Object> data = service.getDashboardData(email);
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // POST method
    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> create(@RequestBody DeliveryCreateDTO dto) {
        try {
            Delivery saved = service.create(dto);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }



    // PUT method
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN', 'DELIVERY')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            Delivery updated = service.updateStatus(id, updates.get("status"));
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // GET method
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN', 'DELIVERY')")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Delivery d = service.findById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", d));
    }

    // GET method
    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getDeliveryByOrderId(@PathVariable Long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        AppUser customer = appUserRepo.findByEmail(auth.getName()).get();


        Order order = orderService.findById(orderId);
        if (!order.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
        }


        Delivery delivery = service.findByOrderId(orderId)
                .orElse(null);


        Map<String, Object> responseData = Map.of("order", order, "delivery", delivery);
        return ResponseEntity.ok(Map.of("success", true, "data", responseData));

    }


    // DELETE method
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Delivery deleted"));
    }
}