package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

public interface MedicineRepository extends org.springframework.data.jpa.repository.JpaRepository<ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine,java.lang.Long> {
    org.springframework.data.domain.Page<ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine> findByNameContainingIgnoreCase(java.lang.String q, org.springframework.data.domain.Pageable pageable);
}