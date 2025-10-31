package ac.nsbm.local_pharmacy_stock_and_delivery_system.config;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AppUserRepository userRepo;

    public UserDetailsServiceImpl(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser u = userRepo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // Grant authority equal to role name (ROLE_...)
        return User.withUsername(u.getEmail())
                .password(u.getPassword())
                .authorities(u.getRole().name())
                .build();
    }
}
