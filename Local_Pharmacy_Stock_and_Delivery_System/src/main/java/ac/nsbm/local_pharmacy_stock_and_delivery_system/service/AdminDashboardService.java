package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.MedicineRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.OrderRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final AppUserRepository appUserRepository;
    private final OrderRepository orderRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;


    public AdminDashboardService(AppUserRepository appUserRepository,
                                 OrderRepository orderRepository,
                                 MedicineRepository medicineRepository,
                                 PrescriptionRepository prescriptionRepository) {
        this.appUserRepository = appUserRepository;
        this.orderRepository = orderRepository;
        this.medicineRepository = medicineRepository;
        this.prescriptionRepository = prescriptionRepository;
    }



    public Map<String, Object> getDashboardStatistics() {
        long totalUsers = appUserRepository.count();
        long totalOrders = orderRepository.count();
        long totalMedicines = medicineRepository.count();
        Double totalRevenue = orderRepository.findTotalRevenue();


        long pendingPrescriptions = prescriptionRepository.countByStatus("PENDING");

        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        List<AppUser> recentUsersList = appUserRepository.findTop3ByOrderByIdDesc();

        List<Map<String, Object>> recentUsersMap = recentUsersList.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole().name());
            userMap.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
            return userMap;
        }).collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrders", totalOrders);
        stats.put("totalMedicines", totalMedicines);
        stats.put("totalRevenue", totalRevenue);
        stats.put("recentUsers", recentUsersMap);
        stats.put("pendingPrescriptions", pendingPrescriptions);

        return stats;
    }

    public Map<String, Object> getAnalyticsData() {
        Map<String, Object> analyticsData = new HashMap<>();

        // 1. Stat Card Data
        Double totalRevenue = orderRepository.findTotalRevenue();
        analyticsData.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        analyticsData.put("totalOrders", orderRepository.count());
        analyticsData.put("activeUsers", appUserRepository.countByRole(Role.ROLE_CUSTOMER));
        analyticsData.put("averageRating", 4.8); // Mocked data as there's no rating in DB

        // 2. User Distribution Chart Data
        Map<String, Long> userDistribution = new HashMap<>();
        userDistribution.put("Customers", appUserRepository.countByRole(Role.ROLE_CUSTOMER));
        userDistribution.put("Pharmacists", appUserRepository.countByRole(Role.ROLE_PHARMACIST));
        userDistribution.put("Delivery", appUserRepository.countByRole(Role.ROLE_DELIVERY));
        userDistribution.put("Admin", appUserRepository.countByRole(Role.ROLE_ADMIN));
        analyticsData.put("userDistribution", userDistribution);

        // 3. Revenue Overview & Order Statistics (last 7 days)
        List<Object[]> orderStats = orderRepository.findOrdersLast7Days();
        // Convert List<Object[]> to a map for easier JS parsing
        Map<String, Long> ordersLast7Days = orderStats.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(), // Key: Date
                        row -> ((Number) row[1]).longValue()  // Value: Count
                ));
        analyticsData.put("ordersLast7Days", ordersLast7Days);
        // We will reuse this data for the "Revenue Overview" chart on the frontend for simplicity

        return analyticsData;
    }
}