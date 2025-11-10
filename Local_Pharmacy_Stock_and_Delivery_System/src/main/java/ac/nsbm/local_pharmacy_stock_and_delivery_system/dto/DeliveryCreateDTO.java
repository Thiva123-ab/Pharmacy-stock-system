package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import java.time.LocalDate;

// This DTO (Data Transfer Object) is used to safely create a new delivery
// from the pharmacist's form.
public class DeliveryCreateDTO {

    private Long orderId;
    private Long driverId;
    private LocalDate scheduledDate;
    private String status;

    // Getters and Setters

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}