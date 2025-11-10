package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AuditLog;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * This is the main method other services will call to create a log entry.
     */
    public void createLog(String username, String action, String resource, String status) {
        try {
            AuditLog log = new AuditLog(username, action, resource, status);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log creation should not crash the main application
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    /**
     * Fetches logs with filtering and pagination.
     */
    public Page<AuditLog> findLogs(String searchTerm, String action, String date, Pageable pageable) {
        // Clean up inputs
        String cleanSearch = (searchTerm == null || searchTerm.isBlank()) ? null : searchTerm;
        String cleanAction = (action == null || action.isBlank()) ? null : action;

        LocalDateTime startDate = null;
        if (date != null && !date.isBlank()) {
            startDate = LocalDate.parse(date).atStartOfDay();
        }

        return auditLogRepository.findWithFilters(cleanSearch, cleanAction, startDate, pageable);
    }
}