package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.CustomerDetailsDTO; // Import the new DTO
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors; // Import needed

@Service
public class CustomerService {
    // ... (Constructor and other methods unchanged)

    public List<CustomerDetailsDTO> findAllCustomers() { // <-- RETURN DTO LIST
        // 1. Fetch all AppUser entities (within an implicit transaction boundary if called from controller)
        CustomerRepository repo = null;
        List<AppUser> customers = repo.findByRole(Role.ROLE_CUSTOMER);

        // 2. Map entities to DTOs here to avoid LazyInitializationException
        return customers.stream()
                .map(CustomerDetailsDTO::fromEntity) // Use the new static factory method
                .collect(Collectors.toList());
    }

    public AppUser update(Long id, AppUser customerDetails) {
        return null;
    }

    // NOTE: If this service method were annotated with @Transactional,
    // the mapping would occur safely before the transaction completes.
    // Ensure that if the controller calls this method, the controller itself is inside a transaction,
    // or rely on Spring's OpenSessionInView (though discouraged).

    // ... (Rest of the CustomerService class)
}