package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ReportFilterDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.*;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final AppUserRepository appUserRepository;
    private final MedicineRepository medicineRepository;
    private final DeliveryRepository deliveryRepository;

    public ReportService(OrderRepository orderRepository, AppUserRepository appUserRepository, MedicineRepository medicineRepository, DeliveryRepository deliveryRepository) {
        this.orderRepository = orderRepository;
        this.appUserRepository = appUserRepository;
        this.medicineRepository = medicineRepository;
        this.deliveryRepository = deliveryRepository;
    }

    // NEW METHOD FOR PHARMACIST DASHBOARD
    public Map<String, Object> getPharmacistDashboardSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        // 1. Get stats for This Month (From 1st of month to Now)
        LocalDate startOfMonth = today.withDayOfMonth(1);
        List<Object[]> monthStatsList = orderRepository.findSalesAndCountForPeriod(startOfMonth.atStartOfDay(), now);
        Double monthSales = (Double) monthStatsList.get(0)[0];
        Long monthOrders = (Long) monthStatsList.get(0)[1];

        // 2. Get "Medicines in Stock"
        long medicinesInStock = medicineRepository.countByQuantityGreaterThan(0);

        // 3. Get "Pending Deliveries"
        long pendingDeliveries = deliveryRepository.countByStatusIn(List.of("PENDING", "ASSIGNED"));

        // 4. Get "Recent Orders"
        List<Order> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc();

        // 5. Build the response map
        return Map.of(
                "totalOrders", monthOrders,
                "medicinesInStock", medicinesInStock,
                "pendingDeliveries", pendingDeliveries,
                "totalRevenue", monthSales,
                "recentOrders", recentOrders
        );
    }


    // This method is for the Pharmacist REPORTS page
    public Map<String, Object> generateSummary(ReportFilterDTO filter) {
        // This method now calculates real stats for the pharmacist report page
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        // 1. Get stats for Today
        List<Object[]> todayStatsList = orderRepository.findSalesAndCountForPeriod(today.atStartOfDay(), now);
        Double todaySales = (Double) todayStatsList.get(0)[0];
        Long todayOrders = (Long) todayStatsList.get(0)[1];

        // 2. Get stats for This Week (From Monday to Now)
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Object[]> weekStatsList = orderRepository.findSalesAndCountForPeriod(startOfWeek.atStartOfDay(), now);
        Double weekSales = (Double) weekStatsList.get(0)[0];
        Long weekOrders = (Long) weekStatsList.get(0)[1];

        // 3. Get stats for This Month (From 1st of month to Now)
        LocalDate startOfMonth = today.withDayOfMonth(1);
        List<Object[]> monthStatsList = orderRepository.findSalesAndCountForPeriod(startOfMonth.atStartOfDay(), now);
        Double monthSales = (Double) monthStatsList.get(0)[0];
        Long monthOrders = (Long) monthStatsList.get(0)[1];

        // 4. Get total customers
        long totalCustomers = appUserRepository.countByRole(Role.ROLE_CUSTOMER);

        // 5. Build the response map
        return Map.of(
                "monthlyRevenue", monthSales,
                "totalOrders", monthOrders,
                "totalCustomers", totalCustomers,
                "growthRate", "+15%", // Mocked: Calculating growth is complex
                "quickStats", Map.of(
                        "todaySales", todaySales,
                        "todayOrders", todayOrders,
                        "weekSales", weekSales,
                        "weekOrders", weekOrders,
                        "monthSales", monthSales,
                        "monthOrders", monthOrders
                )
        );
    }

    // This method remains as-is for the Admin report downloads
    public String generateCsv(String reportType) {
        switch (reportType) {
            case "sales":
                return generateSalesCsv();
            case "user":
                return generateUserCsv();
            case "inventory":
                return generateInventoryCsv();
            case "delivery":
                return generateDeliveryCsv();
            default:
                throw new RuntimeException("Invalid report type specified");
        }
    }

    // Private helper for Sales Report
    private String generateSalesCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Order ID,Customer Name,Total Amount,Status,Date Created\n"); // Header row

        List<Order> orders = orderRepository.findAll();
        for (Order order : orders) {
            csv.append(String.format("\"%s\",\"%s\",\"%.2f\",\"%s\",\"%s\"\n",
                    order.getId(),
                    // Handle potential null customer
                    order.getCustomer() != null ? order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() : "N/A",
                    order.getTotalAmount(),
                    order.getStatus(),
                    order.getCreatedAt().toString()
            ));
        }
        return csv.toString();
    }

    // Private helper for User Report
    private String generateUserCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("User ID,First Name,Last Name,Email,Phone,Role,Status\n"); // Header row

        List<AppUser> users = appUserRepository.findAll();
        for (AppUser user : users) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhone() != null ? user.getPhone() : "",
                    user.getRole().name(),
                    user.getStatus()
            ));
        }
        return csv.toString();
    }

    // Private helper for Inventory Report
    private String generateInventoryCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Medicine ID,Name,Category,Price (LKR),Quantity in Stock\n"); // Header row

        List<Medicine> medicines = medicineRepository.findAll();
        for (Medicine med : medicines) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%.2f\",\"%d\"\n",
                    med.getId(),
                    med.getName(),
                    med.getCategory() != null ? med.getCategory() : "",
                    med.getPriceLKR(),
                    med.getQuantity() != null ? med.getQuantity() : 0
            ));
        }
        return csv.toString();
    }

    // Private helper for Delivery Report
    private String generateDeliveryCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Delivery ID,Order ID,Driver Name,Address,Status,Scheduled Date\n"); // Header row

        List<Delivery> deliveries = deliveryRepository.findAll();
        for (Delivery delivery : deliveries) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    delivery.getId(),
                    delivery.getOrder() != null ? delivery.getOrder().getId() : "N/A",
                    delivery.getDriverName() != null ? delivery.getDriverName() : (delivery.getDriver() != null ? delivery.getDriver().getFirstName() : "N/A"),
                    // Sanitize address by replacing quotes and newlines
                    delivery.getDeliveryAddress() != null ? delivery.getDeliveryAddress().replace("\"", "").replace("\n", " ") : "",
                    delivery.getStatus(),
                    delivery.getScheduledDate() != null ? delivery.getScheduledDate().toString() : ""
            ));
        }
        return csv.toString();
    }
}