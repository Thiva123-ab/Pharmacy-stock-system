package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.CustomerDetailsDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.CustomerCreateDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }


    @GetMapping
    public ResponseEntity<?> listAll() {

        List<CustomerDetailsDTO> customers = service.findAllCustomers();
        return ResponseEntity.ok(Map.of("success", true, "data", customers));
    }


}