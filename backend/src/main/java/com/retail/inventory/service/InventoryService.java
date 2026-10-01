package com.retail.inventory.service;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockTransferRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.ProductRepository;
import com.retail.inventory.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final AuditLogService auditLogService;

    public InventoryService(InventoryRepository inventoryRepository,
                            ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            AuditLogService auditLogService) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.auditLogService = auditLogService;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public List<Inventory> getLowStockInventory() {
        return inventoryRepository.findLowStockInventory();
    }

    @Transactional
    public Inventory adjustStock(StockAdjustmentRequest request, String userEmail) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.getWarehouseId()));

        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> new Inventory(product, warehouse, 0));

        int oldQty = inventory.getQuantity();
        int newQty;

        if ("INCREASE".equalsIgnoreCase(request.getType())) {
            newQty = oldQty + request.getQuantity();
        } else if ("DECREASE".equalsIgnoreCase(request.getType())) {
            if (oldQty < request.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock in warehouse. Current: " + oldQty + ", requested deduction: " + request.getQuantity());
            }
            newQty = oldQty - request.getQuantity();
        } else {
            throw new IllegalArgumentException("Invalid adjustment type: " + request.getType() + ". Must be 'INCREASE' or 'DECREASE'");
        }

        inventory.setQuantity(newQty);
        inventory.setLastUpdated(LocalDateTime.now());
        Inventory saved = inventoryRepository.save(inventory);

        String detail = String.format("Stock %s: Product '%s' in Warehouse '%s'. Changed from %d to %d (Δ %d). Reason: %s",
                request.getType(), product.getName(), warehouse.getName(), oldQty, newQty, request.getQuantity(),
                request.getReason() != null ? request.getReason() : "Manual adjustment");

        auditLogService.log(userEmail, "INVENTORY_ADJUSTED", "INVENTORY", saved.getId().toString(), detail);

        return saved;
    }

    @Transactional
    public void transferStock(StockTransferRequest request, String userEmail) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Transfer quantity must be greater than zero");
        }

        if (request.getFromWarehouseId().equals(request.getToWarehouseId())) {
            throw new IllegalArgumentException("Source and destination warehouses cannot be the same");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));
        Warehouse fromWarehouse = warehouseRepository.findById(request.getFromWarehouseId())
                .orElseThrow(() -> new RuntimeException("Source warehouse not found"));
        Warehouse toWarehouse = warehouseRepository.findById(request.getToWarehouseId())
                .orElseThrow(() -> new RuntimeException("Destination warehouse not found"));

        Inventory fromInventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), fromWarehouse.getId())
                .orElseThrow(() -> new IllegalArgumentException("No inventory record in source warehouse for product: " + product.getName()));

        if (fromInventory.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock in source warehouse. Available: " + fromInventory.getQuantity() + ", requested: " + request.getQuantity());
        }

        Inventory toInventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), toWarehouse.getId())
                .orElseGet(() -> new Inventory(product, toWarehouse, 0));

        fromInventory.setQuantity(fromInventory.getQuantity() - request.getQuantity());
        fromInventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(fromInventory);

        toInventory.setQuantity(toInventory.getQuantity() + request.getQuantity());
        toInventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(toInventory);

        String detail = String.format("Transferred %d units of '%s' from '%s' to '%s'. Reason: %s",
                request.getQuantity(), product.getName(), fromWarehouse.getName(), toWarehouse.getName(),
                request.getReason() != null ? request.getReason() : "Internal transfer");

        auditLogService.log(userEmail, "STOCK_TRANSFERRED", "INVENTORY", product.getId().toString(), detail);
    }
}
