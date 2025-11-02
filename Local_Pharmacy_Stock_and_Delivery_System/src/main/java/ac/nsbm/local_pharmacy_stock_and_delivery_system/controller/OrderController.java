package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AppUserRepository userRepo;

    public OrderController(OrderService orderService, AppUserRepository userRepo) {
        this.orderService = orderService;
        this.userRepo = userRepo;
    }

    // GET /api/orders (Used by orders.js)
    @GetMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Order> orders = orderService.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    // POST /api/orders (Pharmacist manual creation)
    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> createManual(@RequestBody Order order) {
        // Assume simplified Order object for manual creation, items added later
        Order saved = orderService.create(order);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    // PUT /api/orders/{id} (Update Status)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Order updated = orderService.updateStatus(id, updates.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    // DELETE /api/orders/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Order deleted"));
    }
}