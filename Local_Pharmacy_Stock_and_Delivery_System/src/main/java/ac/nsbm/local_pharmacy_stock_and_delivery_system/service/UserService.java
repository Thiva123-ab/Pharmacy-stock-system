package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ProfileUpdateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class UserService {
    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(AppUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public AppUser register(String name, String email, String rawPassword, Role role) {
        Optional<AppUser> existing = repo.findByEmail(email);
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        AppUser u = new AppUser();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(rawPassword));
        u.setRole(role);
        // Initial setup for delivery profile when registering
        if (role == Role.ROLE_DELIVERY) {
            u.setVehicleType("BIKE");
        }
        return repo.save(u);
    }

    public AppUser findByEmail(String email) {
        return repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public AppUser updateProfile(String email, ProfileUpdateDTO dto) {
        AppUser u = findByEmail(email);

        // Frontend sends name split into first/last. We consolidate to AppUser.name
        u.setName(dto.getFirstName() + " " + dto.getLastName());
        u.setPhone(dto.getPhone());
        u.setAddress(dto.getAddress());
        u.setVehicleType(dto.getVehicleType());
        u.setVehicleNumber(dto.getVehicleNumber());

        return repo.save(u);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        AppUser u = findByEmail(email);

        if (!encoder.matches(currentPassword, u.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        u.setPassword(encoder.encode(newPassword));
        repo.save(u);
    }

    @Transactional
    public void updateAvatar(String email, String avatarData) {
        // Placeholder logic to handle avatar data
        AppUser u = findByEmail(email);
        u.setAvatarUrl(avatarData); // Save the Base64 string or a path/URL
        repo.save(u);
    }
}