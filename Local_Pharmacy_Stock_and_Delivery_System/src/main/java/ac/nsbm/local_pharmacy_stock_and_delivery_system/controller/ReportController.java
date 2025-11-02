package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ReportFilterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) { this.service = service; }

    // GET /api/reports/summary?type={sales}&range={month}
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam(defaultValue = "sales") String type,
            @RequestParam(defaultValue = "month") String range) {

        ReportFilterDTO filter = new ReportFilterDTO(type, range);
        Map<String, Object> summary = service.generateSummary(filter);

        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }


    @GetMapping("/export/{format}")
    public ResponseEntity<?> exportReport(@PathVariable String format) {
        return ResponseEntity.ok(Map.of("message", format.toUpperCase() + " export initiated"));
    }
}