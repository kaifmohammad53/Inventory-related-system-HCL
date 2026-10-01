package com.retail.inventory.service;

import com.retail.inventory.dto.DashboardStatsDTO;
import com.retail.inventory.entity.PurchaseOrderStatus;
import com.retail.inventory.repository.*;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrderRepository orderRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            InventoryRepository inventoryRepository,
                            PurchaseOrderRepository purchaseOrderRepository,
                            OrderRepository orderRepository,
                            AuditLogRepository auditLogRepository) {
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderRepository = orderRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalProducts(productRepository.countByActiveTrue());
        stats.setTotalWarehouses(warehouseRepository.countByActiveTrue());
        stats.setTotalInventory(inventoryRepository.sumTotalQuantity());
        stats.setLowStockProducts(inventoryRepository.countLowStockItems());
        stats.setPendingPurchaseOrders(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING));
        stats.setTotalOrders(orderRepository.count());
        stats.setRecentActivities(auditLogRepository.findTop50ByOrderByTimestampDesc());
        return stats;
    }
}
