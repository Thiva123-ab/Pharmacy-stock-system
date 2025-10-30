package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.MedicineRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicineService {
    private final MedicineRepository repo;

    public MedicineService(MedicineRepository repo) { this.repo = repo; }

    public Page<Medicine> search(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return repo.findAll(pageable);
        }
        return repo.findByNameContainingIgnoreCase(q, pageable);
    }

    @Transactional
    public Medicine create(Medicine medicine) {
        return repo.save(medicine);
    }

    @Transactional
    public Medicine updateStock(Long medicineId, int delta) {
        Medicine m = repo.findById(medicineId).orElseThrow(() -> new RuntimeException("Medicine not found"));
        int newQty = (m.getQuantity() == null ? 0 : m.getQuantity()) + delta;
        m.setQuantity(newQty);
        return repo.save(m);
    }
}
