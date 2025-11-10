package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.InventoryLog;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Medicine;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.InventoryLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryLogRepository repo;
    private final MedicineService medicineService;
    private final UserService userService;

    public InventoryService(InventoryLogRepository repo, MedicineService medicineService, UserService userService) {
        this.repo = repo;
        this.medicineService = medicineService;
        this.userService = userService;
    }

    public List<InventoryLog> findAll() {
        return repo.findAll();
    }

    @Transactional
    public InventoryLog create(InventoryLog log, String changedByEmail) {
        AppUser changedBy = userService.findByEmail(changedByEmail);

        // 1. Determine delta and update Medicine stock
        int delta = log.getChangeQty();
        if (log.getMovementType().equals("OUT") || log.getMovementType().equals("EXPIRED")) {
            delta = -delta;
        }

        // NOTE: The log.getMedicine() only contains the ID. We must retrieve the full entity.
        Medicine updatedMedicine = medicineService.updateStock(log.getMedicine().getId(), delta);
        log.setMedicine(updatedMedicine);

        // 2. Save the log
        log.setChangedBy(changedBy);
        return repo.save(log);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}