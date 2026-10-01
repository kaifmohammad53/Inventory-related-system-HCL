package com.retail.inventory.service;

import com.retail.inventory.dto.PurchaseOrderRequest;
import com.retail.inventory.entity.*;
import com.retail.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditLogService auditLogService;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                ProductRepository productRepository,
                                SupplierRepository supplierRepository,
                                WarehouseRepository warehouseRepository,
                                InventoryRepository inventoryRepository,
                                AuditLogService auditLogService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found with id: " + id));
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request, String userEmail) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + request.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.getWarehouseId()));

        String poNumber = "PO-" + System.currentTimeMillis() % 1000000;

        PurchaseOrder po = new PurchaseOrder(poNumber, supplier, warehouse, request.getNotes(), userEmail);
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderRequest.Item itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() :
                    (product.getCostPrice() != null ? product.getCostPrice() : product.getPrice());

            PurchaseOrderItem item = new PurchaseOrderItem(product, itemReq.getQuantity(), unitPrice);
            po.addItem(item);
            totalAmount = totalAmount.add(item.getSubtotal());
        }

        po.setTotalAmount(totalAmount);
        PurchaseOrder saved = purchaseOrderRepository.save(po);

        auditLogService.log(userEmail, "PO_CREATED", "PURCHASE_ORDER", saved.getId().toString(),
                "Created Purchase Order " + saved.getPoNumber() + " with " + saved.getItems().size() + " item(s), total $" + totalAmount);

        return saved;
    }

    @Transactional
    public PurchaseOrder generateAutoReorder(Long productId, Long warehouseId, Long supplierId, Integer quantity, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Warehouse warehouse;
        if (warehouseId != null) {
            warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));
        } else {
            warehouse = warehouseRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No warehouse available for auto-reorder"));
        }

        Supplier supplier;
        if (supplierId != null) {
            supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));
        } else {
            supplier = supplierRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No supplier available for auto-reorder"));
        }

        int reorderQty = (quantity != null && quantity > 0) ? quantity : (product.getReorderLevel() * 2);
        if (reorderQty <= 0) reorderQty = 50;

        BigDecimal unitPrice = product.getCostPrice() != null ? product.getCostPrice() : product.getPrice();

        String poNumber = "PO-AUTO-" + System.currentTimeMillis() % 1000000;
        PurchaseOrder po = new PurchaseOrder(poNumber, supplier, warehouse, "Auto-reorder generated for low stock product: " + product.getName(), userEmail);

        PurchaseOrderItem item = new PurchaseOrderItem(product, reorderQty, unitPrice);
        po.addItem(item);
        po.setTotalAmount(item.getSubtotal());

        PurchaseOrder saved = purchaseOrderRepository.save(po);

        auditLogService.log(userEmail, "AUTO_REORDER_PO", "PURCHASE_ORDER", saved.getId().toString(),
                "Auto-generated PO " + saved.getPoNumber() + " for low-stock product '" + product.getName() + "' (Qty: " + reorderQty + ")");

        return saved;
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, PurchaseOrderStatus newStatus, String userEmail) {
        PurchaseOrder po = getPurchaseOrderById(id);
        PurchaseOrderStatus oldStatus = po.getStatus();

        if (oldStatus == newStatus) {
            return po;
        }

        if (oldStatus == PurchaseOrderStatus.RECEIVED || oldStatus == PurchaseOrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a Purchase Order that is already " + oldStatus);
        }

        po.setStatus(newStatus);

        // When PO is RECEIVED, automatically increment inventory in the destination warehouse!
        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            po.setReceivedAt(LocalDateTime.now());
            Warehouse warehouse = po.getWarehouse();

            for (PurchaseOrderItem item : po.getItems()) {
                Product product = item.getProduct();
                Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                        .orElseGet(() -> new Inventory(product, warehouse, 0));

                inv.setQuantity(inv.getQuantity() + item.getQuantity());
                inv.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(inv);
            }
        }

        PurchaseOrder updated = purchaseOrderRepository.save(po);

        auditLogService.log(userEmail, "PO_STATUS_CHANGED", "PURCHASE_ORDER", updated.getId().toString(),
                String.format("PO %s status changed from %s to %s", updated.getPoNumber(), oldStatus, newStatus));

        return updated;
    }
}
