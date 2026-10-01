package com.retail.inventory.controller;

import com.retail.inventory.dto.WarehouseRequest;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createWarehouse(@RequestBody WarehouseRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Warehouse created = warehouseService.createWarehouse(request, userEmail);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateWarehouse(@PathVariable Long id, @RequestBody WarehouseRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Warehouse updated = warehouseService.updateWarehouse(id, request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            warehouseService.deleteWarehouse(id, userEmail);
            return ResponseEntity.ok(Map.of("message", "Warehouse deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
