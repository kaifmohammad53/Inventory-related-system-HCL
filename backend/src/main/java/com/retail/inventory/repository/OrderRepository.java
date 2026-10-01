package com.retail.inventory.repository;

import com.retail.inventory.entity.Order;
import com.retail.inventory.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatus(OrderStatus status);
    long countByStatus(OrderStatus status);
}
