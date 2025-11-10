package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrder_Id(Long orderId);
    List<Delivery> findByDriver(AppUser driver);
    List<Delivery> findByDriverAndStatus(AppUser driver, String status);


    long countByStatusIn(List<String> statuses);


    List<Delivery> findByDriver_EmailOrderByScheduledDateDesc(String email);

}
