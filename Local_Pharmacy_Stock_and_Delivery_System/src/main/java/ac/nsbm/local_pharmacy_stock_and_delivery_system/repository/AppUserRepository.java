package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

public interface AppUserRepository extends org.springframework.data.jpa.repository.JpaRepository<ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser,java.lang.Long> {
    java.util.Optional<ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.AppUser> findByEmail(java.lang.String email);
}
