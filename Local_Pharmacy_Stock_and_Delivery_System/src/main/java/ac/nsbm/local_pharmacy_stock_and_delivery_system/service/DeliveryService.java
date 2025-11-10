package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.DeliveryCreateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Delivery;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Order;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.DeliveryRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.OrderRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryRepository repo;
    private final AppUserRepository appUserRepo;
    private final OrderRepository orderRepo;
    private final OrderService orderService;
    private final NotificationService notificationService;

    public DeliveryService(DeliveryRepository repo, AppUserRepository appUserRepo, OrderRepository orderRepo, OrderService orderService, NotificationService notificationService) {
        this.repo = repo;
        this.appUserRepo = appUserRepo;
        this.orderRepo = orderRepo;
        this.orderService = orderService;
        this.notificationService = notificationService;
    }

    public List<Delivery> findAll() {
        return repo.findAll();
    }

    public Delivery findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Delivery not found"));
    }

    @Transactional(readOnly = true)
    public Optional<Delivery> findByOrderId(Long orderId) {
        return repo.findByOrder_Id(orderId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardData(String email) {
        AppUser driver = appUserRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found"));

        List<Delivery> allMyDeliveries = repo.findByDriver_EmailOrderByScheduledDateDesc(driver.getEmail());
        LocalDate today = LocalDate.now();

        long assigned = allMyDeliveries.stream()
                .filter(d -> "ASSIGNED".equals(d.getStatus()))
                .count();

        long inTransit = allMyDeliveries.stream()
                .filter(d -> "IN_TRANSIT".equals(d.getStatus()))
                .count();

        List<Delivery> deliveredTodayList = allMyDeliveries.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) && d.getScheduledDate() != null && d.getScheduledDate().isEqual(today))
                .toList();

        long deliveredToday = deliveredTodayList.size();

        double todayEarnings = deliveredTodayList.stream()
                .mapToDouble(d -> d.getEarnings() != null ? d.getEarnings() : 0.0)
                .sum();

        List<Delivery> activeDeliveries = allMyDeliveries.stream()
                .filter(d -> "ASSIGNED".equals(d.getStatus()) || "IN_TRANSIT".equals(d.getStatus()))
                .collect(Collectors.toList());

        List<Delivery> completedDeliveries = allMyDeliveries.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) || "FAILED".equals(d.getStatus()))
                .collect(Collectors.toList());

        List<Delivery> allDeliveredList = allMyDeliveries.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()))
                .toList();

        long totalCompletedAllTime = allDeliveredList.size();

        List<Delivery> completedThisMonthList = allDeliveredList.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) &&
                        d.getScheduledDate() != null &&
                        d.getScheduledDate().getMonth().equals(today.getMonth()) &&
                        d.getScheduledDate().getYear() == today.getYear())
                .toList();

        long completedThisMonth = completedThisMonthList.size();

        double earningsThisMonth = completedThisMonthList.stream()
                .mapToDouble(d -> d.getEarnings() != null ? d.getEarnings() : 0.0)
                .sum();

        double avgRating = allDeliveredList.stream()
                .filter(d -> "DELIVERED".equals(d.getStatus()) && d.getRating() != null)
                .mapToInt(Delivery::getRating)
                .average()
                .orElse(0.0);

        double totalEarningsAllTime = allDeliveredList.stream()
                .mapToDouble(d -> d.getEarnings() != null ? d.getEarnings() : 0.0)
                .sum();

        long totalDeliveriesThisMonth = allMyDeliveries.stream()
                .filter(d -> d.getScheduledDate() != null &&
                        d.getScheduledDate().getMonth().equals(today.getMonth()) &&
                        d.getScheduledDate().getYear() == today.getYear())
                .count();

        long pendingDeliveries = assigned + inTransit;
        double totalDistanceThisMonth = completedThisMonth * 15.2;

        Map<String, Object> data = new HashMap<>();
        data.put("assigned", assigned);
        data.put("inTransit", inTransit);
        data.put("deliveredToday", deliveredToday);
        data.put("todayEarnings", todayEarnings);
        data.put("activeDeliveries", activeDeliveries);
        data.put("completedDeliveries", completedDeliveries);
        data.put("completedThisMonth", completedThisMonth);
        data.put("earningsThisMonth", earningsThisMonth);
        data.put("totalCompletedAllTime", totalCompletedAllTime);
        data.put("averageRating", avgRating);
        data.put("totalEarningsAllTime", totalEarningsAllTime);
        data.put("totalDeliveriesThisMonth", totalDeliveriesThisMonth);
        data.put("pendingDeliveries", pendingDeliveries);
        data.put("totalDistanceThisMonth", totalDistanceThisMonth);

        return data;
    }

    @Transactional
    public Delivery create(DeliveryCreateDTO dto) {
        Order order = orderRepo.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + dto.getOrderId()));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Order is not pending and cannot be assigned for delivery. Current status: " + order.getStatus());
        }

        AppUser driver = appUserRepo.findById(dto.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + dto.getDriverId()));

        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setScheduledDate(dto.getScheduledDate());
        delivery.setStatus(dto.getStatus());


        // This ensures the address from the order is copied to the delivery record.
        delivery.setDeliveryAddress(order.getDeliveryAddress());


        delivery.setDriverName(driver.getFirstName() + " " + driver.getLastName());
        delivery.setDriverPhone(driver.getPhone());
        delivery.setVehicleNumber(driver.getVehicleNumber());

        Delivery savedDelivery = repo.save(delivery);

        // Update the order status to "PROCESSING"
        orderService.updateStatus(order.getId(), "PROCESSING");

        // Send Notification to Customer
        String message = "Your order #ORD-" + String.format("%03d", order.getId()) + " has been assigned for delivery on " + dto.getScheduledDate().toString();
        String link = "/customer/track-order.html?orderId=" + order.getId();
        notificationService.createNotification(order.getCustomer(), message, link);

        return savedDelivery;
    }

    @Transactional
    public Delivery updateStatus(Long id, String newStatus) {
        Delivery delivery = repo.findById(id).orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (!List.of("PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "FAILED").contains(newStatus)) {
            throw new RuntimeException("Invalid status provided: " + newStatus);
        }

        AppUser customer = delivery.getOrder().getCustomer();
        String orderIdStr = "#ORD-" + String.format("%03d", delivery.getOrder().getId());
        String link = "/customer/track-order.html?orderId=" + delivery.getOrder().getId();

        if ("IN_TRANSIT".equals(newStatus)) {
            notificationService.createNotification(customer, "Your order " + orderIdStr + " is now out for delivery!", link);
        } else if ("DELIVERED".equals(newStatus)) {
            delivery.setEarnings(500.00); // Example fee
            delivery.setRating((int) (Math.random() * 2) + 4); // Mock rating 4-5
            orderService.updateStatus(delivery.getOrder().getId(), "COMPLETED");
            notificationService.createNotification(customer, "Your order " + orderIdStr + " has been delivered!", link);
        } else if ("FAILED".equals(newStatus)) {
            orderService.updateStatus(delivery.getOrder().getId(), "FAILED_DELIVERY");
            notificationService.createNotification(customer, "Delivery for order " + orderIdStr + " failed. We will contact you.", link);
        }

        delivery.setStatus(newStatus);
        return repo.save(delivery);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}