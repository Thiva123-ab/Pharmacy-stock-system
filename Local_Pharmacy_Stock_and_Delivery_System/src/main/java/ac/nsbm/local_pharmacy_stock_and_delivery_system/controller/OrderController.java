
package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.OrderRequestDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AppUserRepository userRepo;

    public OrderController(OrderService orderService, AppUserRepository userRepo) {
        this.orderService = orderService;
        this.userRepo = userRepo;
    }

    // GET method
    @GetMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> listAll() {
        List<Order> orders = orderService.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    // GET method
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        AppUser customer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Order> orders = orderService.findOrdersByCustomer(customer.getId());

        return ResponseEntity.ok(Map.of("success", true, "data", orders));
    }

    // POST method
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createCustomerOrder(@RequestBody OrderRequestDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        try {
            Order savedOrder = orderService.createCustomerOrder(dto, email);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", savedOrder));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    // POST method
    @PostMapping
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> createManual(@RequestBody Order order) {
        Order saved = orderService.create(order);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", saved));
    }

    // PUT method
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        Order updated = orderService.updateStatus(id, updates.get("status"));
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    // DELETE method
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Order deleted"));
    }


    @DeleteMapping("/my-order/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelMyOrder(@PathVariable Long orderId, Authentication authentication) {
        String email = authentication.getName();
        try {

            Order cancelledOrder = orderService.cancelPendingOrder(orderId, email);

            return ResponseEntity.ok(Map.of("success", true, "message", "Order successfully cancelled.", "data", cancelledOrder));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

}