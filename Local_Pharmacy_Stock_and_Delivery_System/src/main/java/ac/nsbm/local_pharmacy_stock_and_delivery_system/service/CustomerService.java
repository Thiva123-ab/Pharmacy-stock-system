package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.CustomerDetailsDTO; // Import the new DTO
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {


    // Inject the repository via the constructor
    private final CustomerRepository repo;

    public CustomerService(CustomerRepository customerRepository) {
        this.repo = customerRepository;
    }



    public List<CustomerDetailsDTO> findAllCustomers() { // <-- RETURN DTO LIST
        // 1. Fetch all AppUser entities using the injected repo
        List<AppUser> customers = repo.findByRole(Role.ROLE_CUSTOMER);

        // 2. Map entities to DTOs
        return customers.stream()
                .map(CustomerDetailsDTO::fromEntity) // Use the static factory method
                .collect(Collectors.toList());
    }

    public AppUser update(Long id, AppUser customerDetails) {
        // Implementation for updating a customer can be added here
        return null;
    }

}