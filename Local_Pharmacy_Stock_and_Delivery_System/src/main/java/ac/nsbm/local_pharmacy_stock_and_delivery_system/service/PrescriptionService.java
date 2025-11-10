package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Prescription;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.PrescriptionRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository repo;
    private final AppUserRepository appUserRepo;
    private final NotificationService notificationService;

    public PrescriptionService(PrescriptionRepository repo, AppUserRepository appUserRepo, NotificationService notificationService) { // --- UPDATE CONSTRUCTOR ---
        this.repo = repo;
        this.appUserRepo = appUserRepo;
        this.notificationService = notificationService;
    }


    public List<Prescription> findAll() {
        return repo.findAll();
    }

    public Prescription findById(Long id, String email) {
        AppUser user = appUserRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_CUSTOMER) {
            return repo.findByIdAndSubmittedBy_Id(id, user.getId())
                    .orElseThrow(() -> new RuntimeException("Prescription not found or you do not have permission to view it"));
        }
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
    }

    public List<Prescription> getMyPrescriptions(String email) {
        AppUser user = appUserRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return repo.findBySubmittedBy_IdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public Prescription create(Prescription prescription, String email) {
        AppUser customer = appUserRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found"));

        prescription.setSubmittedBy(customer);
        prescription.setStatus("PENDING"); // Default status
        prescription.setCreatedAt(java.time.LocalDateTime.now()); // Explicitly set createdAt
        return repo.save(prescription);
    }

    @Transactional
    public Prescription updateStatus(Long id, String newStatus) {
        Prescription p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!List.of("PENDING", "APPROVED", "DISPENSED", "REJECTED").contains(newStatus)) {
            throw new RuntimeException("Invalid status provided: " + newStatus);
        }

        p.setStatus(newStatus);


        String link = "/customer/prescriptions.html";
        String prescriptionIdStr = "#RX-" + String.format("%03d", p.getId());
        AppUser customer = p.getSubmittedBy();

        if ("APPROVED".equals(newStatus)) {
            notificationService.createNotification(customer, "Your prescription " + prescriptionIdStr + " has been approved.", link);
        } else if ("REJECTED".equals(newStatus)) {
            notificationService.createNotification(customer, "Your prescription " + prescriptionIdStr + " has been rejected.", link);
        }


        return repo.save(p);
    }


    @Transactional
    public void deleteMyPrescription(Long id, String email) {
        AppUser user = appUserRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_CUSTOMER) {
            Prescription p = repo.findByIdAndSubmittedBy_Id(id, user.getId())
                    .orElseThrow(() -> new RuntimeException("Prescription not found or you do not have permission to delete it"));

            if (!"PENDING".equals(p.getStatus())) {
                throw new RuntimeException("You can only delete prescriptions that are still PENDING.");
            }

            repo.deleteByIdAndSubmittedBy_Id(id, user.getId());

        } else {
            throw new RuntimeException("You do not have permission to delete this resource.");
        }
    }

    @Transactional
    public void adminDelete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Prescription not found");
        }
        repo.deleteById(id);
    }
}