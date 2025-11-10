package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AuditLog;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<?> getLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {


        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        Page<AuditLog> logPage = auditLogService.findLogs(search, action, date, pageable);


        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", logPage.getContent(),
                "currentPage", logPage.getNumber(),
                "totalPages", logPage.getTotalPages(),
                "totalItems", logPage.getTotalElements()
        ));
    }
}