package com.retail.inventory.service;

import com.retail.inventory.dto.ProductRequest;
import com.retail.inventory.entity.Category;
import com.retail.inventory.entity.Product;
import com.retail.inventory.repository.CategoryRepository;
import com.retail.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(query.trim());
    }

    @Transactional
    public Product createProduct(ProductRequest request, String userEmail) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = new Product(
                request.getSku(),
                request.getName(),
                request.getDescription(),
                category,
                request.getPrice(),
                request.getCostPrice(),
                request.getReorderLevel() != null ? request.getReorderLevel() : 10,
                request.getUnit()
        );

        Product saved = productRepository.save(product);

        auditLogService.log(userEmail, "PRODUCT_CREATED", "PRODUCT", saved.getId().toString(),
                "Created product: " + saved.getName() + " (SKU: " + saved.getSku() + ")");

        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request, String userEmail) {
        Product product = getProductById(id);

        if (request.getSku() != null && !request.getSku().equals(product.getSku())) {
            if (productRepository.existsBySku(request.getSku())) {
                throw new IllegalArgumentException("Product with SKU '" + request.getSku() + "' already exists");
            }
            product.setSku(request.getSku());
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice());
        if (request.getReorderLevel() != null) product.setReorderLevel(request.getReorderLevel());
        if (request.getUnit() != null) product.setUnit(request.getUnit());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);

        auditLogService.log(userEmail, "PRODUCT_UPDATED", "PRODUCT", updated.getId().toString(),
                "Updated product: " + updated.getName() + " (SKU: " + updated.getSku() + ")");

        return updated;
    }

    @Transactional
    public void deleteProduct(Long id, String userEmail) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);

        auditLogService.log(userEmail, "PRODUCT_DELETED", "PRODUCT", id.toString(),
                "Deactivated product: " + product.getName() + " (SKU: " + product.getSku() + ")");
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(new Category(name, description)));
    }
}
