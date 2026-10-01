package com.retail.inventory.service;

import com.retail.inventory.dto.ReportSummaryDTO;
import com.retail.inventory.entity.*;
import com.retail.inventory.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrderRepository orderRepository;

    public ReportService(InventoryRepository inventoryRepository,
                         ProductRepository productRepository,
                         PurchaseOrderRepository purchaseOrderRepository,
                         OrderRepository orderRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderRepository = orderRepository;
    }

    public ReportSummaryDTO getReportSummary() {
        ReportSummaryDTO summary = new ReportSummaryDTO();

        List<Inventory> allInventory = inventoryRepository.findAll();
        BigDecimal totalValuation = BigDecimal.ZERO;
        long totalStock = 0;

        for (Inventory inv : allInventory) {
            totalStock += inv.getQuantity();
            if (inv.getProduct() != null && inv.getProduct().getPrice() != null) {
                totalValuation = totalValuation.add(
                        inv.getProduct().getPrice().multiply(BigDecimal.valueOf(inv.getQuantity()))
                );
            }
        }

        summary.setTotalInventoryValuation(totalValuation);
        summary.setTotalStockQuantity(totalStock);
        summary.setTotalProductsCount(productRepository.countByActiveTrue());

        List<Inventory> lowStock = inventoryRepository.findLowStockInventory();
        summary.setLowStockCount(lowStock.size());
        summary.setLowStockItems(lowStock);

        // Purchase Orders Summary
        List<PurchaseOrder> allPOs = purchaseOrderRepository.findAll();
        summary.setTotalPurchaseOrders(allPOs.size());
        BigDecimal totalPOSpent = BigDecimal.ZERO;
        Map<String, Long> poMap = new HashMap<>();
        for (PurchaseOrderStatus s : PurchaseOrderStatus.values()) {
            poMap.put(s.name(), 0L);
        }

        for (PurchaseOrder po : allPOs) {
            poMap.put(po.getStatus().name(), poMap.getOrDefault(po.getStatus().name(), 0L) + 1);
            if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.APPROVED) {
                totalPOSpent = totalPOSpent.add(po.getTotalAmount());
            }
        }
        summary.setTotalPOSpent(totalPOSpent);
        summary.setPoStatusBreakdown(poMap);

        // Sales Orders Summary
        List<Order> allOrders = orderRepository.findAll();
        summary.setTotalSalesOrders(allOrders.size());
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Map<String, Long> orderMap = new HashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            orderMap.put(s.name(), 0L);
        }

        for (Order ord : allOrders) {
            orderMap.put(ord.getStatus().name(), orderMap.getOrDefault(ord.getStatus().name(), 0L) + 1);
            if (ord.getStatus() == OrderStatus.COMPLETED) {
                totalRevenue = totalRevenue.add(ord.getTotalAmount());
            }
        }
        summary.setTotalSalesRevenue(totalRevenue);
        summary.setOrderStatusBreakdown(orderMap);

        return summary;
    }
}
