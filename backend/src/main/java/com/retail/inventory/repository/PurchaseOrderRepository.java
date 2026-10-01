package com.retail.inventory.repository;

import com.retail.inventory.entity.PurchaseOrder;
import com.retail.inventory.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
    long countByStatus(PurchaseOrderStatus status);
}
