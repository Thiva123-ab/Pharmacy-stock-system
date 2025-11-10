package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser;
import lombok.Data;

@Data
public class CustomerDetailsDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Integer totalOrders;
    private String status;


    public static CustomerDetailsDTO fromEntity(AppUser user) {
        CustomerDetailsDTO dto = new CustomerDetailsDTO();
        dto.setId(user.getId());


        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());


        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setTotalOrders(user.getTotalOrders() != null ? user.getTotalOrders() : 0);
        dto.setStatus(user.getStatus());
        return dto;
    }
}