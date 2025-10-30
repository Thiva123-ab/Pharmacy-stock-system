package ac.nsbm.local_pharmacy_stock_and_delivery_system.dto;

public class RegisterDTO {
    @jakarta.validation.constraints.NotBlank
    private java.lang.@jakarta.validation.constraints.NotBlank String name;
    @jakarta.validation.constraints.Email
    @jakarta.validation.constraints.NotBlank
    private java.lang.@jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email;
    @jakarta.validation.constraints.NotBlank
    private java.lang.@jakarta.validation.constraints.NotBlank String password;
    private ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role role;

    @lombok.Generated
    public RegisterDTO() {}

    @lombok.Generated
    public java.lang.String getName() {}

    @lombok.Generated
    public java.lang.String getEmail() {}

    @lombok.Generated
    public java.lang.String getPassword() {}

    @lombok.Generated
    public ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role getRole() {}

    @lombok.Generated
    public void setName(java.lang.String name) {}

    @lombok.Generated
    public void setEmail(java.lang.String email) {}

    @lombok.Generated
    public void setPassword(java.lang.String password) {}

    @lombok.Generated
    public void setRole(ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role role) {}

    @lombok.Generated
    public boolean equals(java.lang.Object o) {}

    @lombok.Generated
    protected boolean canEqual(java.lang.Object other) {}

    @lombok.Generated
    public int hashCode() {}

    @lombok.Generated
    public java.lang.String toString() {}
}
