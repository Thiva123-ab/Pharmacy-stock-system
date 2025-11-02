package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
