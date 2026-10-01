package com.retail.inventory.dto;

import com.retail.inventory.entity.Inventory;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReportSummaryDTO {
    private BigDecimal totalInventoryValuation;
    private long totalProductsCount;
    private long totalStockQuantity;
    private long lowStockCount;
    private List<Inventory> lowStockItems;
    private long totalPurchaseOrders;
    private BigDecimal totalPOSpent;
    private Map<String, Long> poStatusBreakdown;
    private long totalSalesOrders;
    private BigDecimal totalSalesRevenue;
    private Map<String, Long> orderStatusBreakdown;

    public ReportSummaryDTO() {}

    public BigDecimal getTotalInventoryValuation() {
        return totalInventoryValuation;
    }

    public void setTotalInventoryValuation(BigDecimal totalInventoryValuation) {
        this.totalInventoryValuation = totalInventoryValuation;
    }

    public long getTotalProductsCount() {
        return totalProductsCount;
    }

    public void setTotalProductsCount(long totalProductsCount) {
        this.totalProductsCount = totalProductsCount;
    }

    public long getTotalStockQuantity() {
        return totalStockQuantity;
    }

    public void setTotalStockQuantity(long totalStockQuantity) {
        this.totalStockQuantity = totalStockQuantity;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public List<Inventory> getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(List<Inventory> lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public long getTotalPurchaseOrders() {
        return totalPurchaseOrders;
    }

    public void setTotalPurchaseOrders(long totalPurchaseOrders) {
        this.totalPurchaseOrders = totalPurchaseOrders;
    }

    public BigDecimal getTotalPOSpent() {
        return totalPOSpent;
    }

    public void setTotalPOSpent(BigDecimal totalPOSpent) {
        this.totalPOSpent = totalPOSpent;
    }

    public Map<String, Long> getPoStatusBreakdown() {
        return poStatusBreakdown;
    }

    public void setPoStatusBreakdown(Map<String, Long> poStatusBreakdown) {
        this.poStatusBreakdown = poStatusBreakdown;
    }

    public long getTotalSalesOrders() {
        return totalSalesOrders;
    }

    public void setTotalSalesOrders(long totalSalesOrders) {
        this.totalSalesOrders = totalSalesOrders;
    }

    public BigDecimal getTotalSalesRevenue() {
        return totalSalesRevenue;
    }

    public void setTotalSalesRevenue(BigDecimal totalSalesRevenue) {
        this.totalSalesRevenue = totalSalesRevenue;
    }

    public Map<String, Long> getOrderStatusBreakdown() {
        return orderStatusBreakdown;
    }

    public void setOrderStatusBreakdown(Map<String, Long> orderStatusBreakdown) {
        this.orderStatusBreakdown = orderStatusBreakdown;
    }
}
