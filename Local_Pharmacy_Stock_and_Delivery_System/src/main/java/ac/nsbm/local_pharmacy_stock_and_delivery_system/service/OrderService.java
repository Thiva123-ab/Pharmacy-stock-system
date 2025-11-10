package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.CartItemDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.OrderRequestDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.MedicineRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import org.springframework.security.access.AccessDeniedException;
import java.util.Objects;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepo;
    private final MedicineRepository medicineRepo;
    private final AppUserRepository appUserRepo;

    public OrderService(OrderRepository orderRepo, MedicineRepository medicineRepo, AppUserRepository appUserRepo) {
        this.orderRepo = orderRepo;
        this.medicineRepo = medicineRepo;
        this.appUserRepo = appUserRepo;
    }

    /**
     * Finds all orders (for Admin/Pharmacist).
     */
    public List<Order> findAll() {
        return orderRepo.findAll();
    }

    /**
     * Finds all orders for a specific customer ID.
     */
    public List<Order> findOrdersByCustomer(Long customerId) {
        return orderRepo.findByCustomer_IdOrderByCreatedAtDesc(customerId);
    }

    /**
     * Creates a new order from a customer's checkout request.
     */
    @Transactional
    public Order createCustomerOrder(OrderRequestDTO dto, String customerEmail) {
        AppUser customer = appUserRepo.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("PENDING"); // <-- This is the key part
        order.setCreatedAt(LocalDateTime.now());
        order.setDeliveryAddress(customer.getAddress());

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (CartItemDTO cartItem : dto.getItems()) {
            Medicine medicine = medicineRepo.findById(cartItem.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));

            if (medicine.getQuantity() == null || medicine.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + medicine.getName());
            }

            medicine.setQuantity(medicine.getQuantity() - cartItem.getQuantity());
            medicineRepo.save(medicine);

            OrderItem orderItem = new OrderItem();
            orderItem.setMedicine(medicine);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(medicine.getPriceLKR());
            orderItem.setOrder(order);

            orderItems.add(orderItem);
            totalAmount += orderItem.getPrice() * orderItem.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepo.save(order); // <-- The order is saved here

        int currentOrders = customer.getTotalOrders() != null ? customer.getTotalOrders() : 0;
        customer.setTotalOrders(currentOrders + 1);
        appUserRepo.save(customer);

        return savedOrder;
    }

    /**
     * Creates a new order (for Admin/Pharmacist manual creation).
     */
    @Transactional
    public Order create(Order order) {
        if (order.getCustomer() != null && order.getCustomer().getId() != null) {
            AppUser customer = appUserRepo.findById(order.getCustomer().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found for this order"));
            int currentOrders = customer.getTotalOrders() != null ? customer.getTotalOrders() : 0;
            customer.setTotalOrders(currentOrders + 1);
            appUserRepo.save(customer);
            order.setCustomer(customer);
        }
        return orderRepo.save(order);
    }

    public void delete(Long id) {
        orderRepo.deleteById(id);
    }

    public Order findById(Long id) {
        return orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order updateStatus(Long id, String newStatus) {
        Order order = findById(id);
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Cannot change status of a completed order.");
        }
        order.setStatus(newStatus);
        return orderRepo.save(order);
    }


    /**
     * Allows a customer to cancel their own order, ONLY if it is still PENDING.
     * This method restores the stock.
     */
    @Transactional
    public Order cancelPendingOrder(Long orderId, String customerEmail) {
        // 1. Find the order
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // 2. Check ownership
        if (order.getCustomer() == null || !order.getCustomer().getEmail().equals(customerEmail)) {
            throw new AccessDeniedException("You are not authorized to cancel this order.");
        }

        // 3. Check status is "PENDING"
        if (!Objects.equals(order.getStatus(), "PENDING")) {
            throw new RuntimeException("Cannot modify order. It is already being processed.");
        }

        // 4. Restore stock
        for (OrderItem item : order.getItems()) {
            Medicine medicine = item.getMedicine();
            if (medicine != null) {
                int currentStock = medicine.getQuantity() != null ? medicine.getQuantity() : 0;
                medicine.setQuantity(currentStock + item.getQuantity());
                medicineRepo.save(medicine);
            }
        }

        // 5. Decrement customer's totalOrders count
        AppUser customer = order.getCustomer();
        int currentOrders = customer.getTotalOrders() != null ? customer.getTotalOrders() : 0;
        if (currentOrders > 0) {
            customer.setTotalOrders(currentOrders - 1);
            appUserRepo.save(customer);
        }

        // 6. Delete the order (OrderItems will be auto-deleted by cascade)
        orderRepo.delete(order);

        // 7. Return the cancelled order data (without it being in the DB)

        return order;
    }

}