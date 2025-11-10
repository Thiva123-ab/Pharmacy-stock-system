package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ProfileUpdateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.RegisterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final AppUserRepository repo;
    private final PasswordEncoder encoder;
    private final AuditLogService auditLogService; // Injected for logging

    public UserService(AppUserRepository repo, PasswordEncoder encoder, AuditLogService auditLogService) {
        this.repo = repo;
        this.encoder = encoder;
        this.auditLogService = auditLogService;
    }

    public List<AppUser> getAllUsers() {
        return repo.findAll();
    }

    @Transactional
    public AppUser register(String firstName, String lastName, String email, String phone, String rawPassword, Role role) {
        Optional<AppUser> existing = repo.findByEmail(email);
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        AppUser u = new AppUser();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setName(firstName + " " + lastName);
        u.setEmail(email);
        u.setPhone(phone);
        u.setPassword(encoder.encode(rawPassword));
        u.setRole(role);
        u.setStatus("ACTIVE");
        u.setTotalOrders(0);

        if (role == Role.ROLE_DELIVERY) {
            u.setVehicleType("BIKE");
        }
        AppUser savedUser = repo.save(u);

        return savedUser;
    }

    @Transactional
    public AppUser updateUser(Long id, RegisterDTO dto) {
        AppUser userToUpdate = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        userToUpdate.setFirstName(dto.getFirstName());
        userToUpdate.setLastName(dto.getLastName());
        userToUpdate.setName(dto.getFirstName() + " " + dto.getLastName());
        userToUpdate.setEmail(dto.getEmail());
        userToUpdate.setPhone(dto.getPhone());
        userToUpdate.setRole(dto.getRole());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            userToUpdate.setPassword(encoder.encode(dto.getPassword()));
        }

        AppUser savedUser = repo.save(userToUpdate);
        auditLogService.createLog("System (Admin)", "UPDATE", "User #" + savedUser.getId(), "Success");
        return savedUser;
    }

    @Transactional
    public AppUser updateUserStatus(Long id, String newStatus, String adminEmail) {
        AppUser userToUpdate = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (userToUpdate.getEmail().equals(adminEmail)) {
            throw new RuntimeException("You cannot change your own status.");
        }

        userToUpdate.setStatus(newStatus);
        AppUser savedUser = repo.save(userToUpdate);
        auditLogService.createLog(adminEmail, "UPDATE_STATUS", "User #" + savedUser.getId() + " to " + newStatus, "Success");
        return savedUser;
    }

    public AppUser findByEmail(String email) {
        return repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public void deleteUser(Long id, String adminEmail) {
        AppUser userToDelete = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (userToDelete.getEmail().equals(adminEmail)) {
            throw new RuntimeException("You cannot delete your own account.");
        }

        repo.deleteById(id);
        auditLogService.createLog(adminEmail, "DELETE", "User #" + id, "Success");
    }

    @Transactional
    public void deleteOwnAccount(String email) {
        AppUser user = findByEmail(email);
        repo.delete(user);
        auditLogService.createLog(email, "DELETE", "User Profile", "Success");
    }

    @Transactional
    public AppUser updateProfile(String email, ProfileUpdateDTO dto) {
        AppUser u = findByEmail(email);

        // Update Personal Info
        if (dto.getFirstName() != null) u.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) u.setLastName(dto.getLastName());
        if (dto.getFirstName() != null || dto.getLastName() != null) {
            u.setName(u.getFirstName() + " " + u.getLastName());
        }
        if (dto.getPhone() != null) u.setPhone(dto.getPhone());


        // This ensures the address from the profile form is saved to the AppUser.
        if (dto.getAddress() != null) u.setAddress(dto.getAddress());


        if (dto.getDateOfBirth() != null) u.setDateOfBirth(dto.getDateOfBirth());

        // Update Health Info
        if (dto.getBloodGroup() != null) u.setBloodGroup(dto.getBloodGroup());
        if (dto.getAllergies() != null) u.setAllergies(dto.getAllergies());
        if (dto.getMedicalConditions() != null) u.setMedicalConditions(dto.getMedicalConditions());

        // Update Delivery Info
        if (dto.getVehicleType() != null) u.setVehicleType(dto.getVehicleType());
        if (dto.getVehicleNumber() != null) u.setVehicleNumber(dto.getVehicleNumber());

        // Update Settings Fields
        if (dto.getPreferredLanguage() != null) u.setPreferredLanguage(dto.getPreferredLanguage());
        if (dto.getPreferredCurrency() != null) u.setPreferredCurrency(dto.getPreferredCurrency());
        if (dto.getPreferredDarkMode() != null) u.setPreferredDarkMode(dto.getPreferredDarkMode());
        if (dto.getNotifyEmailOrder() != null) u.setNotifyEmailOrder(dto.getNotifyEmailOrder());
        if (dto.getNotifyEmailDelivery() != null) u.setNotifyEmailDelivery(dto.getNotifyEmailDelivery());
        if (dto.getNotifyEmailPromo() != null) u.setNotifyEmailPromo(dto.getNotifyEmailPromo());
        if (dto.getNotifyEmailReminders() != null) u.setNotifyEmailReminders(dto.getNotifyEmailReminders());
        if (dto.getNotifySmsStatus() != null) u.setNotifySmsStatus(dto.getNotifySmsStatus());
        if (dto.getNotifySmsDelivery() != null) u.setNotifySmsDelivery(dto.getNotifySmsDelivery());
        if (dto.getPrivacyDataCollection() != null) u.setPrivacyDataCollection(dto.getPrivacyDataCollection());
        if (dto.getPrivacyShareHealth() != null) u.setPrivacyShareHealth(dto.getPrivacyShareHealth());
        if (dto.getPrivacyMarketing() != null) u.setPrivacyMarketing(dto.getPrivacyMarketing());

        AppUser savedUser = repo.save(u);
        auditLogService.createLog(email, "UPDATE", "User Profile", "Success");
        return savedUser;
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        AppUser u = findByEmail(email);

        if (!encoder.matches(currentPassword, u.getPassword())) {
            auditLogService.createLog(email, "UPDATE_PASSWORD", "User Profile", "Failed");
            throw new RuntimeException("Current password is incorrect");
        }

        u.setPassword(encoder.encode(newPassword));
        repo.save(u);
        auditLogService.createLog(email, "UPDATE_PASSWORD", "User Profile", "Success");
    }

    @Transactional
    public void updateAvatar(String email, String avatarData) {
        AppUser u = findByEmail(email);
        u.setAvatarUrl(avatarData);
        repo.save(u);
        auditLogService.createLog(email, "UPDATE", "User Avatar", "Success");
    }
}