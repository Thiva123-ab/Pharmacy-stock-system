package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Prescription;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) { this.service = service; }


    @GetMapping
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Prescription> list = service.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }


    @GetMapping("/my-prescriptions")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyPrescriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        List<Prescription> list = service.getMyPrescriptions(email);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }


    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> create(@RequestBody Prescription prescription) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Prescription saved = service.create(prescription, email);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }


    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Prescription p = service.findById(id, email);
        return ResponseEntity.ok(Map.of("success", true, "data", p));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Prescription updated = service.updateStatus(id, updates.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteMyPrescription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        try {
            service.deleteMyPrescription(id, email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Prescription deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<?> adminDelete(@PathVariable Long id) {
        service.adminDelete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Prescription deleted by admin"));
    }
}