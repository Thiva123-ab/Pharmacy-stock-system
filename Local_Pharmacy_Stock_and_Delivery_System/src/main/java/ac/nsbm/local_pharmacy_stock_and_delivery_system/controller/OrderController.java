package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AppUserRepository userRepo;

    public OrderController(OrderService orderService, AppUserRepository userRepo) {
        this.orderService = orderService;
        this.userRepo = userRepo;
    }

    @PostMapping("/create/{userId}")
    public ResponseEntity<?> create(@PathVariable Long userId, @RequestBody List<OrderItem> items) {
        Optional<AppUser> uOpt = userRepo.findById(userId);
        if (uOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        Order o = orderService.createOrder(uOpt.get(), items);
        return ResponseEntity.ok(o);
    }
}
