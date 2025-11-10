package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Order;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.OrderRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.PrescriptionRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomerDashboardService {

    private final OrderRepository orderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppUserRepository appUserRepository;

    public CustomerDashboardService(OrderRepository orderRepository,
                                    PrescriptionRepository prescriptionRepository,
                                    AppUserRepository appUserRepository) {
        this.orderRepository = orderRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.appUserRepository = appUserRepository;
    }

    public Map<String, Object> getCustomerDashboardStats(String email) {
        // 1. Get the customer
        AppUser customer = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found"));
        Long customerId = customer.getId();

        // 2. Fetch all customer orders (sorted by newest)
        List<Order> allOrders = orderRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId);

        // 3. Calculate order stats
        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream()
                .filter(order -> "PENDING".equals(order.getStatus()) || "PROCESSING".equals(order.getStatus()))
                .count();
        double totalSpent = allOrders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // 4. Get prescription stats
        long activePrescriptions = prescriptionRepository.countBySubmittedBy_IdAndStatusIn(
                customerId, List.of("ACTIVE", "APPROVED", "PENDING"));

        // 5. Get recent orders (top 5)
        List<Order> recentOrders = allOrders.stream().limit(5).collect(Collectors.toList());

        // 6. Bundle and return
        return Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "totalSpent", totalSpent,
                "activePrescriptions", activePrescriptions,
                "recentOrders", recentOrders
        );
    }
}