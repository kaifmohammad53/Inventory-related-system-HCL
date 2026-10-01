package com.retail.inventory.loader;

import com.retail.inventory.entity.*;
import com.retail.inventory.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrderRepository orderRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           WarehouseRepository warehouseRepository,
                           InventoryRepository inventoryRepository,
                           SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           OrderRepository orderRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderRepository = orderRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Seed Users (Roles: ADMIN, WAREHOUSE_MANAGER, STORE_MANAGER, SUPPLIER)
        User admin = userRepository.save(new User("admin@retail.com", passwordEncoder.encode("admin123"), "Admin Controller", Role.ADMIN, "+1-555-0100"));
        User warehouseMgr = userRepository.save(new User("warehouse@retail.com", passwordEncoder.encode("warehouse123"), "David Logistics", Role.WAREHOUSE_MANAGER, "+1-555-0111"));
        User storeMgr = userRepository.save(new User("store@retail.com", passwordEncoder.encode("store123"), "Sarah Retail", Role.STORE_MANAGER, "+1-555-0122"));
        User supplierUser = userRepository.save(new User("supplier@retail.com", passwordEncoder.encode("supplier123"), "Apex Vendor", Role.SUPPLIER, "+1-555-0133"));

        auditLogRepository.save(new AuditLog("system", "SYSTEM_INIT", "SYSTEM", "1", "System initialized with default roles and accounts"));

        // 2. Seed Categories
        Category catElectronics = categoryRepository.save(new Category("Electronics", "Gadgets, computer hardware, audio, and accessories"));
        Category catApparel = categoryRepository.save(new Category("Apparel", "Fashion wear, casual clothes, jackets and outerwear"));
        Category catHome = categoryRepository.save(new Category("Home & Kitchen", "Appliances, kitchenware, furniture and smart home items"));
        Category catOffice = categoryRepository.save(new Category("Office Supplies", "Office furniture, keyboards, cables and stationery"));
        Category catGroceries = categoryRepository.save(new Category("Groceries & Food", "Packaged dry goods, gourmet coffee, and beverages"));

        // 3. Seed Warehouses
        Warehouse whCentral = warehouseRepository.save(new Warehouse("WH-CENTRAL", "Central Logistics Hub", "Chicago, IL", "100 Logistics Blvd, Chicago, IL 60601", 50000, "David Miller"));
        Warehouse whEast = warehouseRepository.save(new Warehouse("WH-EAST", "East Coast Distribution Depot", "Newark, NJ", "450 Industrial Pkwy, Newark, NJ 07101", 35000, "Sarah Jenkins"));
        Warehouse whWest = warehouseRepository.save(new Warehouse("WH-WEST", "West Coast Fulfillment Center", "Los Angeles, CA", "800 Harbor Way, Los Angeles, CA 90001", 40000, "Robert Chen"));

        // 4. Seed Suppliers
        Supplier supTech = supplierRepository.save(new Supplier("TechGlobal Components", "Alex Turner", "alex@globaltech.com", "+1-555-2010", "123 Silicon Ave, San Jose, CA"));
        Supplier supApparel = supplierRepository.save(new Supplier("Prime Apparel Wholesalers", "Elena Rostova", "elena@primeapparel.com", "+1-555-2020", "78 Fashion Blvd, New York, NY"));
        Supplier supHome = supplierRepository.save(new Supplier("Apex Home Goods Corp", "Marcus Vance", "marcus@apexhome.com", "+1-555-2030", "400 Maple St, Chicago, IL"));
        Supplier supGroceries = supplierRepository.save(new Supplier("Metro Gourmet Supplies", "Linda Zhao", "linda@metrogourmet.com", "+1-555-2040", "55 Farmstead Rd, Dallas, TX"));

        // 5. Seed Products
        Product pMouse = productRepository.save(new Product("SKU-EL-001", "Logitech Wireless Mouse", "High-precision ergonomic 2.4GHz optical mouse", catElectronics, new BigDecimal("89.99"), new BigDecimal("50.00"), 20, "pcs"));
        Product pCable = productRepository.save(new Product("SKU-EL-002", "USB-C Fast Charging Cable 2m", "Durable braided nylon 100W power delivery cable", catElectronics, new BigDecimal("19.99"), new BigDecimal("7.50"), 40, "pcs"));
        Product pMonitor = productRepository.save(new Product("SKU-EL-003", "UltraHD 27\" 4K Monitor", "IPS panel, 144Hz refresh rate with HDR 400", catElectronics, new BigDecimal("349.99"), new BigDecimal("220.00"), 15, "pcs"));
        Product pHeadphones = productRepository.save(new Product("SKU-EL-004", "Active Noise-Cancelling Headphones", "Over-ear wireless headphones with 40-hour battery life", catElectronics, new BigDecimal("159.99"), new BigDecimal("90.00"), 15, "pcs"));
        
        Product pShirt = productRepository.save(new Product("SKU-AP-001", "Premium Cotton Crewneck T-Shirt", "100% organic combed cotton, breathable fit", catApparel, new BigDecimal("24.99"), new BigDecimal("10.00"), 30, "pcs"));
        Product pJacket = productRepository.save(new Product("SKU-AP-002", "Waterproof Winter Down Parka", "Insulated waterproof thermal winter jacket", catApparel, new BigDecimal("139.99"), new BigDecimal("70.00"), 10, "pcs"));

        Product pTumbler = productRepository.save(new Product("SKU-HK-001", "Stainless Steel Thermal Tumbler", "Double-wall vacuum insulated flask 750ml", catHome, new BigDecimal("29.99"), new BigDecimal("12.00"), 25, "pcs"));
        Product pVacuum = productRepository.save(new Product("SKU-HK-002", "Smart Robot Vacuum Cleaner", "LiDAR navigation, self-emptying base station", catHome, new BigDecimal("299.99"), new BigDecimal("175.00"), 10, "pcs"));

        Product pChair = productRepository.save(new Product("SKU-OF-001", "Ergonomic Mesh Office Chair", "Adjustable lumbar support with breathable mesh back", catOffice, new BigDecimal("219.99"), new BigDecimal("120.00"), 12, "pcs"));
        Product pKeyboard = productRepository.save(new Product("SKU-OF-002", "Mechanical Gaming Keyboard RGB", "Hot-swappable tactile switches with aluminum top plate", catOffice, new BigDecimal("99.99"), new BigDecimal("55.00"), 20, "pcs"));

        Product pCoffee = productRepository.save(new Product("SKU-GR-001", "Artisan Roasted Espresso Beans 1kg", "Single-origin Arabica beans medium-dark roast", catGroceries, new BigDecimal("22.99"), new BigDecimal("11.50"), 30, "bags"));

        // 6. Seed Inventory across Warehouses
        // Intentionally create some LOW STOCK items to demonstrate low-stock badge & auto-reorder feature!
        inventoryRepository.save(new Inventory(pMouse, whCentral, 85));
        inventoryRepository.save(new Inventory(pMouse, whEast, 6)); // LOW STOCK (reorder level is 20)
        
        inventoryRepository.save(new Inventory(pCable, whCentral, 140));
        inventoryRepository.save(new Inventory(pCable, whWest, 12)); // LOW STOCK (reorder level is 40)

        inventoryRepository.save(new Inventory(pMonitor, whCentral, 4)); // LOW STOCK (reorder level is 15)
        inventoryRepository.save(new Inventory(pMonitor, whWest, 28));

        inventoryRepository.save(new Inventory(pHeadphones, whCentral, 55));
        inventoryRepository.save(new Inventory(pHeadphones, whEast, 42));

        inventoryRepository.save(new Inventory(pShirt, whCentral, 120));
        inventoryRepository.save(new Inventory(pJacket, whCentral, 30));
        inventoryRepository.save(new Inventory(pJacket, whEast, 5)); // LOW STOCK (reorder level is 10)

        inventoryRepository.save(new Inventory(pTumbler, whCentral, 90));
        inventoryRepository.save(new Inventory(pVacuum, whCentral, 18));
        inventoryRepository.save(new Inventory(pChair, whCentral, 35));
        inventoryRepository.save(new Inventory(pKeyboard, whCentral, 75));
        inventoryRepository.save(new Inventory(pCoffee, whCentral, 110));

        // 7. Seed Sample Purchase Orders
        PurchaseOrder po1 = new PurchaseOrder("PO-10001", supTech, whCentral, "Initial Q3 electronics replenishment", "admin@retail.com");
        po1.setStatus(PurchaseOrderStatus.APPROVED);
        po1.addItem(new PurchaseOrderItem(pMouse, 50, new BigDecimal("50.00")));
        po1.addItem(new PurchaseOrderItem(pKeyboard, 30, new BigDecimal("55.00")));
        po1.setTotalAmount(new BigDecimal("4150.00"));
        purchaseOrderRepository.save(po1);

        PurchaseOrder po2 = new PurchaseOrder("PO-10002", supApparel, whEast, "Urgent winter outerwear stock", "admin@retail.com");
        po2.setStatus(PurchaseOrderStatus.PENDING);
        po2.addItem(new PurchaseOrderItem(pJacket, 25, new BigDecimal("70.00")));
        po2.setTotalAmount(new BigDecimal("1750.00"));
        purchaseOrderRepository.save(po2);

        PurchaseOrder po3 = new PurchaseOrder("PO-10003", supHome, whCentral, "Restock smart home appliances", "warehouse@retail.com");
        po3.setStatus(PurchaseOrderStatus.RECEIVED);
        po3.setReceivedAt(LocalDateTime.now().minusDays(2));
        po3.addItem(new PurchaseOrderItem(pTumbler, 50, new BigDecimal("12.00")));
        po3.setTotalAmount(new BigDecimal("600.00"));
        purchaseOrderRepository.save(po3);

        // 8. Seed Sample Sales Orders
        Order order1 = new Order("SO-20001", "Acme Retail Co.", "orders@acme.com", whCentral, "Express shipping requested", "store@retail.com");
        order1.setStatus(OrderStatus.COMPLETED);
        order1.addItem(new OrderItem(pMouse, 10, new BigDecimal("89.99")));
        order1.addItem(new OrderItem(pKeyboard, 5, new BigDecimal("99.99")));
        order1.setTotalAmount(new BigDecimal("1399.85"));
        orderRepository.save(order1);

        Order order2 = new Order("SO-20002", "TechHub Solutions", "procure@techhub.io", whCentral, "Standard delivery", "store@retail.com");
        order2.setStatus(OrderStatus.PENDING);
        order2.addItem(new OrderItem(pMonitor, 2, new BigDecimal("349.99")));
        order2.addItem(new OrderItem(pHeadphones, 4, new BigDecimal("159.99")));
        order2.setTotalAmount(new BigDecimal("1339.94"));
        orderRepository.save(order2);

        // 9. Initial Audit Logs
        auditLogRepository.save(new AuditLog("admin@retail.com", "PRODUCT_CREATED", "PRODUCT", pMouse.getId().toString(), "Added initial catalog item: " + pMouse.getName()));
        auditLogRepository.save(new AuditLog("warehouse@retail.com", "INVENTORY_ADJUSTED", "INVENTORY", "1", "Initial stock intake at WH-CENTRAL"));
        auditLogRepository.save(new AuditLog("admin@retail.com", "PO_CREATED", "PURCHASE_ORDER", po1.getId().toString(), "Created PO-10001 for TechGlobal Components"));
        auditLogRepository.save(new AuditLog("store@retail.com", "ORDER_CREATED", "ORDER", order1.getId().toString(), "Created Sales Order SO-20001 for Acme Retail Co."));
    }
}
