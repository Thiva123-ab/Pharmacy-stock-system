package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {


    List<Feedback> findAllByOrderByCreatedAtDesc();
}
