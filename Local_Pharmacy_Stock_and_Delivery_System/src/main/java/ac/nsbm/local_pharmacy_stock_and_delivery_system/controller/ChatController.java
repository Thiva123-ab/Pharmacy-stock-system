
package ac.nsbm.local_pharmacy_stock_and_delivery_system.controller;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ChatMessageDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.dto.ChatMessageResponseDTO;
import ac.nsbm.local_pharmacy_stock_and_delivery_system.service.ChatService;


import org.springframework.messaging.simp.SimpMessagingTemplate;


import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final ChatService chatService;

    private final SimpMessagingTemplate messagingTemplate;


    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }


    @MessageMapping("/chat.sendMessage/{orderId}")
    public void sendMessage(@Payload ChatMessageDTO chatMessage,
                            @DestinationVariable Long orderId,
                            Principal principal) {
        if (principal == null) {
            throw new AccessDeniedException("User is not authenticated.");
        }

        chatMessage.setOrderId(orderId);


        ChatMessageResponseDTO responseDTO = chatService.postMessage(chatMessage, principal.getName());


        String chatType = responseDTO.getChatType();
        messagingTemplate.convertAndSend("/topic/order/" + orderId + "/" + chatType, responseDTO);
    }



    @GetMapping("/api/chat/history/{orderId}/{chatType}")
    @ResponseBody
    public ResponseEntity<?> getChatHistory(@PathVariable Long orderId,
                                            @PathVariable String chatType,
                                            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        try {
            List<ChatMessageResponseDTO> history = chatService.getChatHistory(orderId, chatType, principal.getName());
            return ResponseEntity.ok(Map.of("success", true, "data", history));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

}