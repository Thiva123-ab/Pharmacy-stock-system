package ac.nsbm.local_pharmacy_stock_and_delivery_system.repository;

import ac.nsbm.local_pharmacy_stock_and_delivery_system.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);




    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' OR o.status = 'DELIVERED'")
    Double findTotalRevenue();


    @Query(value = "SELECT DATE(created_at) as orderDate, COUNT(id) as orderCount " +
            "FROM orders " +
            "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY orderDate ASC", nativeQuery = true)
    List<Object[]> findOrdersLast7Days();


    List<Order> findTop5ByOrderByCreatedAtDesc();


    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0), COUNT(o.id) " +
            "FROM Order o " +
            "WHERE (o.status = 'COMPLETED' OR o.status = 'DELIVERED') " +
            "AND o.createdAt BETWEEN :start AND :end")
    List<Object[]> findSalesAndCountForPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


}
