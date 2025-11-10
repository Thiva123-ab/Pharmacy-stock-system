package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {


    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);


    long countByRecipient_IdAndIsRead(Long recipientId, boolean isRead);
}
