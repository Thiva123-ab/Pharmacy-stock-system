package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
}
