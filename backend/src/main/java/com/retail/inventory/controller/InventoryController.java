package com.retail.inventory.controller;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockTransferRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/warehouse/{warehouseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<List<Inventory>> getInventoryByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getInventoryByWarehouse(warehouseId));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<List<Inventory>> getInventoryByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<List<Inventory>> getLowStockInventory() {
        return ResponseEntity.ok(inventoryService.getLowStockInventory());
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<?> adjustStock(@RequestBody StockAdjustmentRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Inventory updated = inventoryService.adjustStock(request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<?> transferStock(@RequestBody StockTransferRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            inventoryService.transferStock(request, userEmail);
            return ResponseEntity.ok(Map.of("message", "Stock transferred successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
