package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface MedicineRepository extends JpaRepository<Medicine, Long> {


    long countByQuantityGreaterThan(int quantity);


    Page<Medicine> findByNameContainingIgnoreCase(String name, Pageable pageable);

}