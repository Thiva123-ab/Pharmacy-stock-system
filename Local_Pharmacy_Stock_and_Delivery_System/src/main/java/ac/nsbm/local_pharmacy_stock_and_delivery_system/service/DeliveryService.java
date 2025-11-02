package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryRepository repo;

    public DeliveryService(DeliveryRepository repo) { this.repo = repo; }

    public List<Delivery> findAll() {
        return repo.findAll();
    }

    public Delivery findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Delivery not found"));
    }

    @Transactional
    public Delivery create(Delivery delivery) {
        delivery.setStatus("PENDING");
        // Logic to link to AppUser driver needed
        return repo.save(delivery);
    }

    @Transactional
    public Delivery updateStatus(Long id, String newStatus) {
        Delivery delivery = repo.findById(id).orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (!List.of("PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED").contains(newStatus)) {
            throw new RuntimeException("Invalid status provided: " + newStatus);
        }

        // Add more specific role/status logic here (e.g., only Delivery person can set IN_TRANSIT)

        delivery.setStatus(newStatus);
        return repo.save(delivery);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}