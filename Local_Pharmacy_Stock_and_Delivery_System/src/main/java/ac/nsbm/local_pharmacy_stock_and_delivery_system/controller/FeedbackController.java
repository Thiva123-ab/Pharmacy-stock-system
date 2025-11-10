
package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.FeedbackDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.FeedbackResponseDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }


    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllFeedback() {
        List<FeedbackResponseDTO> feedbackList = feedbackService.getAllFeedback();
        return ResponseEntity.ok(Map.of("success", true, "data", feedbackList));
    }


    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> postFeedback(@RequestBody FeedbackDTO dto, Authentication authentication) {
        try {
            FeedbackResponseDTO newFeedback = feedbackService.postFeedback(dto, authentication.getName());
            return ResponseEntity.status(201).body(Map.of("success", true, "data", newFeedback));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}