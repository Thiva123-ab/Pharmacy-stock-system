package ac.nsbm.local_pharmacy_stock_and_delivery_system.service;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ChatMessageDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ChatMessageResponseDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.*;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final AppUserRepository appUserRepository;
    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final NotificationService notificationService;

    public ChatService(ChatMessageRepository chatMessageRepository, AppUserRepository appUserRepository,
                       OrderRepository orderRepository, DeliveryRepository deliveryRepository,
                       NotificationService notificationService) {
        this.chatMessageRepository = chatMessageRepository;
        this.appUserRepository = appUserRepository;
        this.orderRepository = orderRepository;
        this.deliveryRepository = deliveryRepository;
        this.notificationService = notificationService;
    }

    /**
     * Posts a new message and saves it to the database.
     */
    @Transactional
    public ChatMessageResponseDTO postMessage(ChatMessageDTO dto, String username) {
        AppUser sender = findUser(username);
        Order order = findOrder(dto.getOrderId());
        String chatType = dto.getChatType();

        if (!isUserAllowedInChat(sender, order, chatType)) {
            throw new AccessDeniedException("You do not have permission to post in this chat.");
        }

        ChatMessage message = new ChatMessage(order, sender, dto.getContent(), chatType);
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // CREATE NOTIFICATION LOGIC
        createChatNotification(sender, order, chatType);

        return ChatMessageResponseDTO.fromEntity(savedMessage);
    }

    /**
     * Gets the full chat history for a specific order and chat type.
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getChatHistory(Long orderId, String chatType, String username) {
        AppUser user = findUser(username);
        Order order = findOrder(orderId);

        if (!isUserAllowedInChat(user, order, chatType)) {
            throw new AccessDeniedException("You do not have permission to view this chat.");
        }

        return chatMessageRepository.findByOrder_IdAndChatTypeOrderByTimestampAsc(orderId, chatType)
                .stream()
                .map(ChatMessageResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private void createChatNotification(AppUser sender, Order order, String chatType) {
        String message = String.format("New message from %s for Order #ORD-%03d", sender.getFirstName(), order.getId());
        String link = String.format("/chat/order/%d/%s", order.getId(), chatType);

        Role senderRole = sender.getRole();

        if (Objects.equals(chatType, "PHARMACIST")) {
            // Customer <-> Pharmacist
            if (senderRole == Role.ROLE_CUSTOMER) {
                // Notify all Admins and Pharmacists
                List<AppUser> recipients = Stream.concat(
                        appUserRepository.findAllByRole(Role.ROLE_ADMIN).stream(),
                        appUserRepository.findAllByRole(Role.ROLE_PHARMACIST).stream()
                ).toList();
                recipients.forEach(r -> notificationService.createNotification(r, message, link));
            } else {
                // Notify the Customer
                notificationService.createNotification(order.getCustomer(), message, link);
            }

        } else if (Objects.equals(chatType, "DELIVERY")) {
            // Customer <-> Delivery Driver
            if (senderRole == Role.ROLE_CUSTOMER) {
                // Notify the assigned Driver
                deliveryRepository.findByOrder_Id(order.getId()).ifPresent(delivery -> {
                    if (delivery.getDriver() != null) {
                        notificationService.createNotification(delivery.getDriver(), message, link);
                    }
                });
            } else {
                // Notify the Customer
                notificationService.createNotification(order.getCustomer(), message, link);
            }

        } else if (Objects.equals(chatType, "LOGISTICS")) {
            // Pharmacist <-> Delivery Driver
            if (senderRole == Role.ROLE_DELIVERY) {
                // Notify all Admins and Pharmacists
                List<AppUser> recipients = Stream.concat(
                        appUserRepository.findAllByRole(Role.ROLE_ADMIN).stream(),
                        appUserRepository.findAllByRole(Role.ROLE_PHARMACIST).stream()
                ).toList();
                recipients.forEach(r -> notificationService.createNotification(r, message, link));
            } else {
                // Notify the assigned Driver
                deliveryRepository.findByOrder_Id(order.getId()).ifPresent(delivery -> {
                    if (delivery.getDriver() != null) {
                        notificationService.createNotification(delivery.getDriver(), message, link);
                    }
                });
            }
        }
    }


    // Helper Methods

    private AppUser findUser(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    private boolean isUserAllowedInChat(AppUser user, Order order, String chatType) {
        Role userRole = user.getRole();

        if (Objects.equals(chatType, "PHARMACIST")) {
            // Customer <-> Pharmacist
            return userRole == Role.ROLE_ADMIN ||
                    userRole == Role.ROLE_PHARMACIST ||
                    (userRole == Role.ROLE_CUSTOMER && order.getCustomer().getId().equals(user.getId()));

        } else if (Objects.equals(chatType, "DELIVERY")) {
            // Customer <-> Delivery Driver
            if (userRole == Role.ROLE_CUSTOMER && order.getCustomer().getId().equals(user.getId())) {
                return true;
            }
            if (userRole == Role.ROLE_DELIVERY) {
                Delivery delivery = deliveryRepository.findByOrder_Id(order.getId()).orElse(null);
                return delivery != null && delivery.getDriver() != null && delivery.getDriver().getId().equals(user.getId());
            }

        } else if (Objects.equals(chatType, "LOGISTICS")) {
            // Pharmacist <-> Delivery Driver
            if (userRole == Role.ROLE_ADMIN || userRole == Role.ROLE_PHARMACIST) {
                return true; // Admin/Pharmacist can always join
            }
            if (userRole == Role.ROLE_DELIVERY) {
                Delivery delivery = deliveryRepository.findByOrder_Id(order.getId()).orElse(null);
                // Assigned driver can join
                return delivery != null && delivery.getDriver() != null && delivery.getDriver().getId().equals(user.getId());
            }
        }

        return false; // Deny by default
    }
}