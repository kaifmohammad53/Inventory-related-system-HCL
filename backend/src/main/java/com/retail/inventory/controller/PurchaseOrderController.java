package com.retail.inventory.controller;

import com.retail.inventory.dto.PurchaseOrderRequest;
import com.retail.inventory.entity.PurchaseOrder;
import com.retail.inventory.entity.PurchaseOrderStatus;
import com.retail.inventory.service.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER')")
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER')")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<?> createPurchaseOrder(@RequestBody PurchaseOrderRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            PurchaseOrder po = purchaseOrderService.createPurchaseOrder(request, userEmail);
            return ResponseEntity.ok(po);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auto-reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<?> generateAutoReorder(
            @RequestParam Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Integer quantity,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            PurchaseOrder po = purchaseOrderService.generateAutoReorder(productId, warehouseId, supplierId, quantity, userEmail);
            return ResponseEntity.ok(po);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            String statusStr = body.get("status");
            PurchaseOrderStatus status = PurchaseOrderStatus.valueOf(statusStr.toUpperCase());
            PurchaseOrder updated = purchaseOrderService.updateStatus(id, status, userEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
