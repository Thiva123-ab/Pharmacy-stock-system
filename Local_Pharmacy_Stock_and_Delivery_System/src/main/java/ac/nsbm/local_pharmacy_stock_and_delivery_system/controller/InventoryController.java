package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.InventoryLog;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) { this.service = service; }

    // GET method
    @GetMapping
    public ResponseEntity<?> listAll() {
        List<InventoryLog> logs = service.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", logs));
    }

    // POST method
    @PostMapping
    public ResponseEntity<?> create(@RequestBody InventoryLog log) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String changedByEmail = auth.getName();

        InventoryLog saved = service.create(log, changedByEmail);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    // DELETE method
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Inventory log deleted"));
    }
}