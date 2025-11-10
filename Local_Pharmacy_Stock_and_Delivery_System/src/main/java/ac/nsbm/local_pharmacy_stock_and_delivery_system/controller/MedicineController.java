package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService service;

    public MedicineController(MedicineService service) { this.service = service; }

    // GET method
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(@RequestParam(defaultValue = "") String q, @PageableDefault(size = 20) Pageable pageable) {
        Page<Medicine> page = service.search(q, pageable);
        return ResponseEntity.ok(Map.of("success", true, "data", page.getContent()));
    }

    // GET method
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Medicine m = service.findById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", m));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody Medicine m) {
        Medicine saved = service.create(m);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody Medicine m) {
        Medicine updated = service.update(id, m);
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Medicine deleted"));
    }
}