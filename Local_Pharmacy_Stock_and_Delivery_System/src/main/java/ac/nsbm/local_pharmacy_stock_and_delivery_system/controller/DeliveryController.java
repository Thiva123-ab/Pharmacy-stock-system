package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) { this.service = service; }

    // GET /api/deliveries (Pharmacist/Admin view all)
    @GetMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN', 'DELIVERY')") // Allow Delivery person to see their list
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Delivery> list = service.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    // POST /api/deliveries (Pharmacist assigning delivery)
    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> create(@RequestBody Delivery delivery) {
        Delivery saved = service.create(delivery);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    // PUT /api/deliveries/{id} (Pharmacist/Delivery Person updating status)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN', 'DELIVERY')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Delivery updated = service.updateStatus(id, updates.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    // GET /api/deliveries/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN', 'DELIVERY')")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Delivery d = service.findById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", d));
    }

    // DELETE /api/deliveries/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Delivery deleted"));
    }
}