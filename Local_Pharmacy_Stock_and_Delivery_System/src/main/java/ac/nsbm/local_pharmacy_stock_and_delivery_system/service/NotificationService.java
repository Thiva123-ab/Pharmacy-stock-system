package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Notification;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.AppUserRepository;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.NotificationRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;

    public NotificationService(NotificationRepository notificationRepository, AppUserRepository appUserRepository) {
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Creates and saves a new notification for a user.
     * This is the method other services will call.
     */
    @Transactional
    public void createNotification(AppUser recipient, String message, String link) {
        if (recipient == null) {
            return; // Don't create a message for a null user
        }
        Notification notification = new Notification(recipient, message, link);
        notificationRepository.save(notification);
    }

    /**
     * Gets all notifications for the currently logged-in user.
     */
    public List<Notification> getNotificationsForUser(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * Marks a specific notification as read.
     */
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security check: Make sure the user owns this notification
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to update this notification.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}