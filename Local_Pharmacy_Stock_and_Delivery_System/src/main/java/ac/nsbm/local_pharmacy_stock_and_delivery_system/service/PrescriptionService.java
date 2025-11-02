package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Prescription;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository repo;

    public PrescriptionService(PrescriptionRepository repo) { this.repo = repo; }

    public List<Prescription> findAll() {
        return repo.findAll();
    }

    public Prescription findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Prescription not found"));
    }

    @Transactional
    public Prescription create(Prescription prescription) {
        prescription.setStatus("PENDING");
        // Logic to link to submitting AppUser needed
        return repo.save(prescription);
    }

    @Transactional
    public Prescription updateStatus(Long id, String newStatus) {
        Prescription p = repo.findById(id).orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!List.of("PENDING", "APPROVED", "DISPENSED", "REJECTED").contains(newStatus)) {
            throw new RuntimeException("Invalid status provided: " + newStatus);
        }

        p.setStatus(newStatus);
        return repo.save(p);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}