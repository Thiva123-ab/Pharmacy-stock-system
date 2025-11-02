package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Prescription;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) { this.service = service; }

    // GET /api/prescriptions (Pharmacist/Customer)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Prescription> list = service.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    // POST /api/prescriptions (Customer submitting or Pharmacist adding)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Prescription prescription) {
        Prescription saved = service.create(prescription);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    // GET /api/prescriptions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Prescription p = service.findById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", p));
    }

    // PUT /api/prescriptions/{id} (Pharmacist updating status)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Prescription updated = service.updateStatus(id, updates.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    // DELETE /api/prescriptions/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Prescription deleted"));
    }
}