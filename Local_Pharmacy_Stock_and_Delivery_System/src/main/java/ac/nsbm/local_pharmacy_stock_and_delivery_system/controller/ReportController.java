package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ReportFilterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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


    @GetMapping("/pharmacist-dashboard")
    public ResponseEntity<?> getPharmacistDashboardSummary() {
        try {
            Map<String, Object> summary = service.getPharmacistDashboardSummary();
            return ResponseEntity.ok(Map.of("success", true, "data", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // GET method
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam(defaultValue = "sales") String type,
            @RequestParam(defaultValue = "month") String range) {

        ReportFilterDTO filter = new ReportFilterDTO(type, range);
        Map<String, Object> summary = service.generateSummary(filter);

        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }


    // GET method
    @GetMapping("/export/{reportType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportReport(@PathVariable String reportType) {
        try {

            String csvData = service.generateCsv(reportType);
            String fileName = reportType + "_report.csv";


            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
            headers.add(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");


            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvData);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Error generating report: " + e.getMessage());
        }
    }
}