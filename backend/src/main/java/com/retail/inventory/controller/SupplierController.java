package com.retail.inventory.controller;

import com.retail.inventory.dto.SupplierRequest;
import com.retail.inventory.entity.Supplier;
import com.retail.inventory.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSupplier(@RequestBody SupplierRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Supplier created = supplierService.createSupplier(request, userEmail);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody SupplierRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Supplier updated = supplierService.updateSupplier(id, request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            supplierService.deleteSupplier(id, userEmail);
            return ResponseEntity.ok(Map.of("message", "Supplier deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
