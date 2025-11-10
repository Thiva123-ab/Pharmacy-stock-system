package ac.nsbm.local_pharmacy_stock_and_delivery_system.exception;


import org.springframework.dao.DataIntegrityViolationException;


import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String,String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        // Use a 400 Bad Request status and include "success: false"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Validation failed", "errors", errors));
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        String userFriendlyMessage = "This user cannot be deleted. They are associated with existing orders, prescriptions, or deliveries.";

        // This checks the error message to be more specific
        if (ex.getMessage().contains("customer_id")) {
            userFriendlyMessage = "Cannot delete user: They have existing orders.";
        } else if (ex.getMessage().contains("recipient_id")) {
            userFriendlyMessage = "Cannot delete user: They have existing notifications.";
        }

        // Return a 400 Bad Request with the friendly message
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", userFriendlyMessage));
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        // Return a map that matches the {success, message} format
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        ex.printStackTrace();
        // Return a map that matches the {success, message} format
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "A server error occurred."));
    }
}