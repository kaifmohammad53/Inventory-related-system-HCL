package com.retail.inventory.controller;

import com.retail.inventory.dto.ProductRequest;
import com.retail.inventory.entity.Category;
import com.retail.inventory.entity.Product;
import com.retail.inventory.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Product created = productService.createProduct(request, userEmail);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            Product updated = productService.updateProduct(id, request, userEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : "system";
            productService.deleteProduct(id, userEmail);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
