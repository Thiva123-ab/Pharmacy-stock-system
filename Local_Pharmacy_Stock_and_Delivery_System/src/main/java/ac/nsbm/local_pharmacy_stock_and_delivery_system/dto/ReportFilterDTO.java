package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportFilterDTO {
    private String reportType;
    private String dateRange;
}
