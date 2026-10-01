# Retail Inventory Management System (MVP)

A full-stack, enterprise-grade Retail Inventory Management application developed according to the project SRS for college evaluation and operational usage.

---

## 🚀 Live Application Status

- **Frontend URL**: [http://localhost:4200](http://localhost:4200) (Angular 21 + Angular Router + Modern Responsive CSS)
- **Backend API**: [http://localhost:8081](http://localhost:8081) (Spring Boot + Spring Security + JWT + Spring Data JPA)
- **Database**: MySQL 8.0 running on `localhost:3307`, Database: `retail_inventory_db`

---

## 🔑 Default Login Credentials

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@retail.com` | `admin123` | Full access across all modules, catalogs, and logs |
| **WAREHOUSE_MANAGER** | `warehouse@retail.com` | `warehouse123` | Stock adjustments, transfers, PO receiving |
| **STORE_MANAGER** | `store@retail.com` | `store123` | Sales orders, catalog lookup, low-stock reordering |
| **SUPPLIER** | `supplier@retail.com` | `supplier123` | Purchase order tracking & dispatch status |

---

## 🏛️ System Architecture

```
Angular UI (Port 4200)
       │
       ▼  (REST API with JWT Bearer Token)
Spring Boot Backend (Port 8081)
       │
       ▼  (Spring Data JPA / Hibernate)
MySQL Database (Port 3307 / retail_inventory_db)
```

---

## 📦 Implemented Modules

### 1. Authentication & Security
- Modern login interface with role badges.
- Stateless **JWT-based Authentication** using JJWT (`io.jsonwebtoken`).
- BCrypt password encryption with 4 seeded role accounts.

### 2. Dashboard
- Real-time KPI summary cards:
  - **Total Products**
  - **Total Inventory**
  - **Low Stock Items Alert**
  - **Total Warehouses**
  - **Pending Purchase Orders**
  - **Total Orders**
- Live **Recent Activity Stream** populated by the automated audit log subsystem.

### 3. Product Catalog
- **Add Product** modal with fields: `SKU`, `Name`, `Description`, `Category`, `Price`, `Cost Price`, `Reorder Level`, `Unit`.
- **Search & Filter**: Real-time multi-attribute search (SKU, title, category).
- **Edit & Delete**: Full CRUD with instant UI reflection and audit logging.

### 4. Warehouse Management
- Full CRUD for multi-warehouse setups:
  - Code, Name, Location, Address, Capacity, Warehouse Manager.
- Seeded with 3 hubs: Central (Chicago), East (Newark), West (Los Angeles).

### 5. Inventory Management
- Per-warehouse stock tracking.
- **Stock In (Increase)** and **Stock Out (Decrease)** with reasons.
- **Stock Transfer**: Move stock between warehouses with validation checks.
- **LOW STOCK Alert Badges**: Automatically highlight products whose total or warehouse quantity drops below their reorder level.

### 6. Supplier Management
- Supplier directory with contact person, phone, email, and address.
- Seamless linkage with Purchase Order generation.

### 7. Purchase Orders (PO)
- Create PO by selecting a supplier, warehouse, and adding item rows.
- Dynamic subtotal and total calculations.
- Multi-state lifecycle: `PENDING` ➔ `APPROVED` ➔ `RECEIVED` ➔ `CANCELLED`.
- **Automatic Stock Intake**: When a PO transitions to `RECEIVED`, inventory in the designated warehouse is automatically incremented.

### 8. Auto-Reorder Subsystem
- When a product drops to or below its reorder level, the system triggers a low-stock alert.
- Provides a one-click **"Generate Purchase Order"** action.
- Pre-populates the PO with the supplier, product, and recommended reorder quantity.

### 9. Sales Orders
- Create sales orders with customer information, destination warehouse, and item rows.
- **Automatic Stock Deduction**: Validates available inventory and immediately deducts stock upon creation.
- If an order is subsequently `CANCELLED`, inventory is safely restored.

### 10. Reports & Analytics
- **Inventory Valuation**: Calculates total asset value based on quantities and unit pricing.
- **Low Stock Breakdown**: Dedicated review list of items needing immediate replenishment.
- **Purchase Order Summary**: Financial and status breakdown.
- **Sales Order Summary**: Total revenue and status metrics.

### 11. Audit Logs
- Automatically captures every critical event with timestamp, user email, action type, target entity, and detailed description.

---

## 🛠️ Quick Start Instructions

Double-click `start-all.bat` in the project root to start MySQL, Spring Boot, and Angular in separate windows and open the dashboard in your browser.
