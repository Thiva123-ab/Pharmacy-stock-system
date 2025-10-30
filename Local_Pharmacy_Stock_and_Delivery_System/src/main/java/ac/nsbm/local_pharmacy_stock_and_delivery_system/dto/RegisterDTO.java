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
    public RegisterDTO() { /* compiled code */ }

    @lombok.Generated
    public java.lang.String getName() { /* compiled code */ }

    @lombok.Generated
    public java.lang.String getEmail() { /* compiled code */ }

    @lombok.Generated
    public java.lang.String getPassword() { /* compiled code */ }

    @lombok.Generated
    public ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role getRole() { /* compiled code */ }

    @lombok.Generated
    public void setName(java.lang.String name) { /* compiled code */ }

    @lombok.Generated
    public void setEmail(java.lang.String email) { /* compiled code */ }

    @lombok.Generated
    public void setPassword(java.lang.String password) { /* compiled code */ }

    @lombok.Generated
    public void setRole(ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Role role) { /* compiled code */ }

    @lombok.Generated
    public boolean equals(java.lang.Object o) { /* compiled code */ }

    @lombok.Generated
    protected boolean canEqual(java.lang.Object other) { /* compiled code */ }

    @lombok.Generated
    public int hashCode() { /* compiled code */ }

    @lombok.Generated
    public java.lang.String toString() { /* compiled code */ }
}
