package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.MedicineRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepo;
    private final MedicineRepository medicineRepo;

    public OrderService(OrderRepository orderRepo, MedicineRepository medicineRepo) {
        this.orderRepo = orderRepo;
        this.medicineRepo = medicineRepo;
    }

    public List<Order> findAll() {
        return orderRepo.findAll();
    }

    public Order create(Order order) {
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

        // Basic state validation (e.g., cannot go back from COMPLETED)
        if (order.getStatus().equals("COMPLETED")) {
            throw new RuntimeException("Cannot change status of a completed order.");
        }

        order.setStatus(newStatus);
        return orderRepo.save(order);
    }

    @Transactional
    public Order createOrder(AppUser customer, List<OrderItem> items) {
        double total = 0.0;
        for (OrderItem it : items) {
            Medicine med = medicineRepo.findById(it.getMedicine().getId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));

            if (med.getQuantity() == null || med.getQuantity() < it.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + med.getName());
            }
            med.setQuantity(med.getQuantity() - it.getQuantity());
            medicineRepo.save(med);

            it.setPrice(med.getPriceLKR());
            total += it.getPrice() * it.getQuantity();
            it.setMedicine(med);
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setItems(items);
        order.setTotalAmount(total);
        order.setStatus("PENDING");

        orderRepo.save(order);
        for (OrderItem it : items) {
            it.setOrder(order);
        }
        return orderRepo.save(order);
    }
}