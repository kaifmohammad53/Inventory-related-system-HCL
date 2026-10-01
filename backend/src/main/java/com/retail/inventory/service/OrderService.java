package com.retail.inventory.service;

import com.retail.inventory.dto.OrderRequest;
import com.retail.inventory.entity.*;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.OrderRepository;
import com.retail.inventory.repository.ProductRepository;
import com.retail.inventory.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditLogService auditLogService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        WarehouseRepository warehouseRepository,
                        InventoryRepository inventoryRepository,
                        AuditLogService auditLogService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Transactional
    public Order createOrder(OrderRequest request, String userEmail) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.getWarehouseId()));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // First validate that sufficient inventory exists for all items
        for (OrderRequest.Item itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new IllegalArgumentException("No stock for product '" + product.getName() + "' in warehouse " + warehouse.getName()));

            if (inventory.getQuantity() < itemReq.getQuantity()) {
                throw new IllegalArgumentException(String.format("Insufficient stock for '%s' in warehouse '%s'. Available: %d, Ordered: %d",
                        product.getName(), warehouse.getName(), inventory.getQuantity(), itemReq.getQuantity()));
            }
        }

        String orderNumber = "SO-" + System.currentTimeMillis() % 1000000;
        Order order = new Order(orderNumber, request.getCustomerName(), request.getCustomerEmail(), warehouse, request.getNotes(), userEmail);
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.Item itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).get();
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getPrice();

            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), unitPrice);
            order.addItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Deduct inventory
            Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId()).get();
            inventory.setQuantity(inventory.getQuantity() - itemReq.getQuantity());
            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inventory);
        }

        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);

        auditLogService.log(userEmail, "ORDER_CREATED", "ORDER", saved.getId().toString(),
                String.format("Created Sales Order %s for customer '%s', total: $%s. Stock deducted from warehouse '%s'",
                        saved.getOrderNumber(), saved.getCustomerName(), totalAmount, warehouse.getName()));

        return saved;
    }

    @Transactional
    public Order updateStatus(Long id, OrderStatus newStatus, String userEmail) {
        Order order = getOrderById(id);
        OrderStatus oldStatus = order.getStatus();

        if (oldStatus == newStatus) {
            return order;
        }

        // If order is cancelled and was not cancelled before, restore the deducted stock
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            Warehouse warehouse = order.getWarehouse();
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                        .orElseGet(() -> new Inventory(product, warehouse, 0));
                inv.setQuantity(inv.getQuantity() + item.getQuantity());
                inv.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(inv);
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        auditLogService.log(userEmail, "ORDER_STATUS_CHANGED", "ORDER", updated.getId().toString(),
                String.format("Order %s status changed from %s to %s", updated.getOrderNumber(), oldStatus, newStatus));

        return updated;
    }
}
