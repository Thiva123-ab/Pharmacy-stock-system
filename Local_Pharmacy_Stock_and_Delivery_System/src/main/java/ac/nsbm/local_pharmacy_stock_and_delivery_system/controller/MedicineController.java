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

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService service;

    public MedicineController(MedicineService service) { this.service = service; }

    @GetMapping
    public Page<Medicine> list(@RequestParam(defaultValue = "") String q, @PageableDefault(size = 20) Pageable pageable) {
        return service.search(q, pageable);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST','ADMIN')")
    public ResponseEntity<Medicine> create(@Valid @RequestBody Medicine m) {
        Medicine saved = service.create(m);
        return ResponseEntity.status(201).body(saved);
    }
}
