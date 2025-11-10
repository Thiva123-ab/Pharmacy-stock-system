package ac.nsbm.local_pharmacy_stock_and_delivery_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;
    private Integer patientAge;

    private String doctorName;
    private String diagnosis;
    private String medicines;
    private String dosageInstructions;

    private LocalDate issueDate;
    private LocalDate expiryDate;

    private String status;

    private String fileUrl;

    @ManyToOne
    private AppUser submittedBy;


    private LocalDateTime createdAt = LocalDateTime.now();
}