package com.retail.inventory.repository;

import com.retail.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByWarehouseId(Long warehouseId);
    List<Inventory> findByProductId(Long productId);
    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i")
    Long sumTotalQuantity();

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.product.reorderLevel")
    List<Inventory> findLowStockInventory();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity <= i.product.reorderLevel")
    long countLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.warehouse.id = :warehouseId AND i.quantity <= i.product.reorderLevel")
    List<Inventory> findLowStockByWarehouse(@Param("warehouseId") Long warehouseId);
}
