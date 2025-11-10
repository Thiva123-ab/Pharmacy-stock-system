package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // Methods for CUSTOMER page
    Optional<Prescription> findByIdAndSubmittedBy_Id(Long prescriptionId, Long customerId);

    List<Prescription> findBySubmittedBy_IdOrderByCreatedAtDesc(Long customerId);

    @Transactional
    void deleteByIdAndSubmittedBy_Id(Long prescriptionId, Long customerId);

    long countBySubmittedBy_IdAndStatusIn(Long customerId, List<String> statuses);


    /**
     * Counts all prescriptions that have a specific status (e..g, "PENDING").
     * (Needed for AdminDashboardService)
     */
    long countByStatus(String status);

}