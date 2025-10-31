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

    @Transactional
    public Order createOrder(AppUser customer, List<OrderItem> items) {
        double total = 0.0;
        for (OrderItem it : items) {
            Medicine med = medicineRepo.findById(it.getMedicine().getId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found"));
            if (med.getQuantity() == null || med.getQuantity() < it.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + med.getName());
            }
            med.setQuantity(med.getQuantity() - it.getQuantity()); // decrement stock
            medicineRepo.save(med);
            it.setPrice(med.getPriceLKR());
            total += it.getPrice() * it.getQuantity();
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
