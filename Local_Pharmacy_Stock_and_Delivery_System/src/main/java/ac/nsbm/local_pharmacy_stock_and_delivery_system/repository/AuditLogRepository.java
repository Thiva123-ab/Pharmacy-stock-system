package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {


    @Query("SELECT log FROM AuditLog log WHERE " +
            "(:searchTerm IS NULL OR log.username LIKE %:searchTerm% OR log.resource LIKE %:searchTerm%) AND " +
            "(:action IS NULL OR log.action = :action) AND " +
            "(:startDate IS NULL OR log.timestamp >= :startDate)")
    Page<AuditLog> findWithFilters(
            @Param("searchTerm") String searchTerm,
            @Param("action") String action,
            @Param("startDate") LocalDateTime startDate,
            Pageable pageable
    );
}
