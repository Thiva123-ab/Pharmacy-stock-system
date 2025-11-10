package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.FeedbackDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.FeedbackResponseDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Feedback;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.FeedbackRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AppUserRepository appUserRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, AppUserRepository appUserRepository) {
        this.feedbackRepository = feedbackRepository;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Get all feedback entries, newest first.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(FeedbackResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Post new feedback from an authenticated customer.
     */
    @Transactional
    public FeedbackResponseDTO postFeedback(FeedbackDTO dto, String customerEmail) {
        AppUser customer = appUserRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5.");
        }
        if (dto.getComment() == null || dto.getComment().isBlank()) {
            throw new RuntimeException("Comment cannot be empty.");
        }

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return FeedbackResponseDTO.fromEntity(savedFeedback);
    }
}