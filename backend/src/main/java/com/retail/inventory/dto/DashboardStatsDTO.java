package com.retail.inventory.dto;

import com.retail.inventory.entity.AuditLog;
import java.util.List;

public class DashboardStatsDTO {
    private long totalProducts;
    private long totalInventory;
    private long lowStockProducts;
    private long totalWarehouses;
    private long pendingPurchaseOrders;
    private long totalOrders;
    private List<AuditLog> recentActivities;

    public DashboardStatsDTO() {}

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalInventory() {
        return totalInventory;
    }

    public void setTotalInventory(long totalInventory) {
        this.totalInventory = totalInventory;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalWarehouses() {
        return totalWarehouses;
    }

    public void setTotalWarehouses(long totalWarehouses) {
        this.totalWarehouses = totalWarehouses;
    }

    public long getPendingPurchaseOrders() {
        return pendingPurchaseOrders;
    }

    public void setPendingPurchaseOrders(long pendingPurchaseOrders) {
        this.pendingPurchaseOrders = pendingPurchaseOrders;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public List<AuditLog> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<AuditLog> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
