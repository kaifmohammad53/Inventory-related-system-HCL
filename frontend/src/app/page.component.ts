import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from './api.service';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFormComponent } from './product-form.component';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  price: number;
  costPrice: number;
  reorderLevel: number;
  unit: string;
  active: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe, DatePipe, FormsModule, ProductFormComponent],
  template: `
    <div class="app-shell">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="logo">Retail<span>Inventory</span></div>

        <nav class="nav-menu">
          @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER', 'SUPPLIER'])) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">📊 Dashboard</a>
          }
          @if (hasRole(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER'])) {
            <a routerLink="/products" routerLinkActive="active" class="nav-item">📦 Products</a>
          }
          @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'])) {
            <a routerLink="/inventory" routerLinkActive="active" class="nav-item">🏷️ Inventory</a>
          }
          @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER'])) {
            <a routerLink="/warehouses" routerLinkActive="active" class="nav-item">🏭 Warehouses</a>
          }
          @if (hasRole(['ADMIN', 'SUPPLIER', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'])) {
            <a routerLink="/suppliers" routerLinkActive="active" class="nav-item">🚚 Suppliers</a>
          }
          @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER'])) {
            <a routerLink="/purchase-orders" routerLinkActive="active" class="nav-item">📋 Purchase Orders</a>
          }
          @if (hasRole(['ADMIN', 'STORE_MANAGER'])) {
            <a routerLink="/orders" routerLinkActive="active" class="nav-item">🛒 Sales Orders</a>
          }
          @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'])) {
            <a routerLink="/reports" routerLinkActive="active" class="nav-item">📈 Reports</a>
          }
          @if (hasRole(['ADMIN'])) {
            <a routerLink="/audit-logs" routerLinkActive="active" class="nav-item">📜 Audit Logs</a>
          }
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="page-title">Retail Inventory Management System</div>

          <div class="user-menu-container">
            <button class="user-profile-trigger" (click)="toggleProfileMenu($event)" title="User Profile Menu">
              <span class="role-badge">{{ formattedRoleName }}</span>
              <span class="user-name">{{ userName }}</span>
              <div class="user-avatar">
                {{ (userName || 'A').charAt(0).toUpperCase() }}
              </div>
              <span class="dropdown-arrow" [class.open]="showProfileMenu">▾</span>
            </button>

            @if (showProfileMenu) {
              <div class="profile-dropdown" (click)="$event.stopPropagation()">
                <div class="profile-dropdown-header">
                  <div class="avatar-lg">{{ (userName || 'A').charAt(0).toUpperCase() }}</div>
                  <div class="user-meta">
                    <div class="header-name">{{ userName }}</div>
                    <div class="header-email">{{ userEmail }}</div>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <div class="menu-list">
                  <div class="menu-item-info">
                    <span class="menu-icon">👤</span>
                    <div class="menu-text">
                      <span class="menu-title">Profile</span>
                      <span class="menu-sub">{{ userName }}</span>
                    </div>
                  </div>

                  <div class="menu-item-info">
                    <span class="menu-icon">🛡️</span>
                    <div class="menu-text">
                      <span class="menu-title">Role</span>
                      <span class="menu-sub role-highlight">{{ formattedRoleName }}</span>
                    </div>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <button class="menu-logout-btn" (click)="logout()">
                  <span class="menu-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            }
          </div>
        </header>

        <!-- CONTENT AREA -->
        <section class="content">
          <!-- PAGE HEADER & CONTEXT-AWARE ACTIONS -->
          <div class="page-header">
            <div>
              <h1>{{ title }}</h1>
              <p>{{ description }}</p>
            </div>

            <div class="header-actions">
              @if (currentPage === 'products' && hasRole(['ADMIN', 'STORE_MANAGER'])) {
                <button class="primary-btn" (click)="openAddProduct()">+ Add Product</button>
              } @else if (currentPage === 'inventory' && hasRole(['ADMIN', 'WAREHOUSE_MANAGER'])) {
                <button class="secondary-btn" (click)="openTransferModal()">🔄 Transfer Stock</button>
                <button class="primary-btn" (click)="openAdjustModal()">📥 Adjust Stock</button>
              } @else if (currentPage === 'warehouses' && hasRole(['ADMIN'])) {
                <button class="primary-btn" (click)="openAddWarehouse()">+ Add Warehouse</button>
              } @else if (currentPage === 'suppliers' && hasRole(['ADMIN'])) {
                <button class="primary-btn" (click)="openAddSupplier()">+ Add Supplier</button>
              } @else if (currentPage === 'purchase-orders' && hasRole(['ADMIN', 'WAREHOUSE_MANAGER'])) {
                <button class="primary-btn" (click)="openCreatePO()">+ Create Purchase Order</button>
              } @else if (currentPage === 'orders' && hasRole(['ADMIN', 'STORE_MANAGER'])) {
                <button class="primary-btn" (click)="openCreateOrder()">+ Create Sales Order</button>
              } @else if (currentPage === 'reports') {
                <button class="secondary-btn" (click)="loadReports()">🔄 Refresh Data</button>
              } @else if (currentPage === 'audit-logs' && hasRole(['ADMIN'])) {
                <button class="secondary-btn" (click)="loadAuditLogs()">🔄 Refresh Logs</button>
              }
            </div>
          </div>

          <!-- FEEDBACK MESSAGES -->
          @if (successMessage) {
            <div class="success-box">
              <span>✓ {{ successMessage }}</span>
              <button class="box-close" (click)="successMessage = ''">×</button>
            </div>
          }

          @if (errorMessage) {
            <div class="error-box">
              <span>⚠ {{ errorMessage }}</span>
              <button class="box-close" (click)="errorMessage = ''">×</button>
            </div>
          }

          <!-- ==================================================== -->
          <!-- 1. DASHBOARD PAGE -->
          <!-- ==================================================== -->
          @if (currentPage === 'dashboard') {
            <div class="stats-grid">
              <div class="stat-card" (click)="navigateTo('/products')">
                <div class="stat-label">Total Products</div>
                <div class="stat-value">{{ dashboardStats.totalProducts }}</div>
                <div class="stat-hint">Active catalog SKUs →</div>
              </div>

              <div class="stat-card" (click)="navigateTo('/inventory')">
                <div class="stat-label">Total Inventory</div>
                <div class="stat-value">{{ dashboardStats.totalInventory }}</div>
                <div class="stat-hint">Units across warehouses →</div>
              </div>

              <div class="stat-card alert-stat" (click)="navigateTo('/inventory')">
                <div class="stat-label">Low Stock Items</div>
                <div class="stat-value alert-text">{{ dashboardStats.lowStockProducts }}</div>
                <div class="stat-hint">Below reorder level →</div>
              </div>

              <div class="stat-card" (click)="navigateTo('/warehouses')">
                <div class="stat-label">Total Warehouses</div>
                <div class="stat-value">{{ dashboardStats.totalWarehouses }}</div>
                <div class="stat-hint">Storage facilities →</div>
              </div>

              <div class="stat-card" (click)="navigateTo('/purchase-orders')">
                <div class="stat-label">Pending Purchase Orders</div>
                <div class="stat-value">{{ dashboardStats.pendingPurchaseOrders }}</div>
                <div class="stat-hint">Awaiting processing →</div>
              </div>

              <div class="stat-card" (click)="navigateTo('/orders')">
                <div class="stat-label">Total Sales Orders</div>
                <div class="stat-value">{{ dashboardStats.totalOrders }}</div>
                <div class="stat-hint">Fulfillment records →</div>
              </div>
            </div>

            <!-- Recent Activity Widget -->
            <div class="card" style="margin-top: 24px;">
              <div class="card-header-row">
                <div class="card-title">Live System Activity & Audit Trail</div>
                <button class="small-btn" (click)="loadDashboardStats()">Refresh</button>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (activity of dashboardStats.recentActivities.slice(0, 10); track activity.id) {
                      <tr>
                        <td>{{ activity.timestamp | date: 'medium' }}</td>
                        <td><strong>{{ activity.userEmail }}</strong></td>
                        <td><span class="action-tag">{{ activity.action }}</span></td>
                        <td>{{ activity.entityName }} #{{ activity.entityId }}</td>
                        <td>{{ activity.details }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="empty-state">No recent activity recorded.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

          <!-- ==================================================== -->
          <!-- 2. PRODUCTS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'products') {
            <app-product-form
              [open]="showProductForm"
              [product]="editingProduct"
              [categories]="categories"
              (closed)="closeProductForm()"
              (saved)="onProductSaved($event)"
            ></app-product-form>

            <div class="search-row">
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                class="search-input"
                [(ngModel)]="searchText"
                (input)="filterProducts()"
              />

              <select class="filter-select" [(ngModel)]="statusFilter" (change)="filterProducts()">
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            @if (loading) {
              <div class="loading">Loading products...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Products Directory</div>
                  <div class="product-count">{{ filteredProducts.length }} Products</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Selling Price</th>
                        <th>Cost Price</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (product of filteredProducts; track product.id) {
                        <tr>
                          <td>
                            <div class="product-name">{{ product.name }}</div>
                            <div class="product-description">{{ product.description }}</div>
                          </td>
                          <td><span class="sku">{{ product.sku }}</span></td>
                          <td>{{ product.category?.name || 'Uncategorized' }}</td>
                          <td>₹{{ product.price | number: '1.2-2' }}</td>
                          <td>₹{{ product.costPrice | number: '1.2-2' }}</td>
                          <td>{{ product.reorderLevel }} {{ product.unit }}</td>
                          <td>
                            @if (product.active) {
                              <span class="badge badge-success">Active</span>
                            } @else {
                              <span class="badge badge-warning">Inactive</span>
                            }
                          </td>
                          <td>
                            @if (hasRole(['ADMIN', 'STORE_MANAGER'])) {
                              <button class="small-btn" (click)="openEditProduct(product)">Edit</button>
                              <button class="delete-btn" (click)="deleteProduct(product)">Delete</button>
                            } @else {
                              <span style="color: #94a3b8; font-size: 12px;">View only</span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="8" class="empty-state">No products found matching criteria.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 3. INVENTORY PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'inventory') {
            <div class="search-row">
              <select class="filter-select" [(ngModel)]="selectedInventoryWarehouseId" (change)="filterInventory()">
                <option value="0">All Warehouses</option>
                @for (wh of warehouses; track wh.id) {
                  <option [value]="wh.id">{{ wh.name }} ({{ wh.code }})</option>
                }
              </select>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="showLowStockOnly" (change)="filterInventory()" />
                ⚠️ Show Low Stock Only
              </label>
            </div>

            @if (loading) {
              <div class="loading">Loading inventory...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Stock Levels by Warehouse</div>
                  <div class="product-count">{{ filteredInventory.length }} Records</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Warehouse</th>
                        <th>Stock Quantity</th>
                        <th>Reorder Level</th>
                        <th>Stock Status</th>
                        <th>Last Updated</th>
                        <th>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of filteredInventory; track item.id) {
                        <tr [class.low-stock-row]="item.quantity <= item.product.reorderLevel">
                          <td><strong>{{ item.product.name }}</strong></td>
                          <td><span class="sku">{{ item.product.sku }}</span></td>
                          <td>{{ item.warehouse.name }}</td>
                          <td>
                            <strong [class.alert-text]="item.quantity <= item.product.reorderLevel">
                              {{ item.quantity }} {{ item.product.unit }}
                            </strong>
                          </td>
                          <td>{{ item.product.reorderLevel }} {{ item.product.unit }}</td>
                          <td>
                            @if (item.quantity <= item.product.reorderLevel) {
                              <span class="badge badge-danger">LOW STOCK</span>
                            } @else {
                              <span class="badge badge-success">Optimal</span>
                            }
                          </td>
                          <td>{{ item.lastUpdated | date: 'short' }}</td>
                          <td>
                            @if (hasRole(['ADMIN', 'WAREHOUSE_MANAGER'])) {
                              @if (item.quantity <= item.product.reorderLevel) {
                                <button class="auto-reorder-btn" (click)="triggerAutoReorder(item)">⚡ Auto Reorder</button>
                              }
                              <button class="small-btn" (click)="openQuickAdjust(item)">Adjust</button>
                            } @else {
                              <span style="color: #94a3b8; font-size: 12px;">View only</span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="8" class="empty-state">No inventory records found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 4. WAREHOUSES PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'warehouses') {
            @if (loading) {
              <div class="loading">Loading warehouses...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Warehouses & Storage Facilities</div>
                  <div class="product-count">{{ warehouses.length }} Warehouses</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Warehouse Code</th>
                        <th>Facility Name</th>
                        <th>Location</th>
                        <th>Address</th>
                        <th>Capacity</th>
                        <th>Manager</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (warehouse of warehouses; track warehouse.id) {
                        <tr>
                          <td><span class="sku">{{ warehouse.code }}</span></td>
                          <td><strong>{{ warehouse.name }}</strong></td>
                          <td>{{ warehouse.location }}</td>
                          <td>{{ warehouse.address }}</td>
                          <td>{{ warehouse.capacity | number }} units</td>
                          <td>{{ warehouse.manager }}</td>
                          <td>
                            @if (warehouse.active) {
                              <span class="badge badge-success">Active</span>
                            } @else {
                              <span class="badge badge-warning">Inactive</span>
                            }
                          </td>
                          <td>
                            @if (hasRole(['ADMIN'])) {
                              <button class="small-btn" (click)="openEditWarehouse(warehouse)">Edit</button>
                              <button class="delete-btn" (click)="deleteWarehouse(warehouse)">Delete</button>
                            } @else {
                              <span style="color: #94a3b8; font-size: 12px;">View only</span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="8" class="empty-state">No warehouses found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 5. SUPPLIERS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'suppliers') {
            @if (loading) {
              <div class="loading">Loading suppliers...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Vendors & Suppliers Directory</div>
                  <div class="product-count">{{ suppliers.length }} Suppliers</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Supplier Name</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (supplier of suppliers; track supplier.id) {
                        <tr>
                          <td><strong>{{ supplier.name }}</strong></td>
                          <td>{{ supplier.contactPerson }}</td>
                          <td>{{ supplier.email }}</td>
                          <td>{{ supplier.phone }}</td>
                          <td>{{ supplier.address }}</td>
                          <td>
                            @if (supplier.active) {
                              <span class="badge badge-success">Active</span>
                            } @else {
                              <span class="badge badge-warning">Inactive</span>
                            }
                          </td>
                          <td>
                            @if (hasRole(['ADMIN'])) {
                              <button class="small-btn" (click)="openEditSupplier(supplier)">Edit</button>
                              <button class="delete-btn" (click)="deleteSupplier(supplier)">Delete</button>
                            } @else {
                              <span style="color: #94a3b8; font-size: 12px;">View only</span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="empty-state">No suppliers found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 6. PURCHASE ORDERS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'purchase-orders') {
            @if (loading) {
              <div class="loading">Loading purchase orders...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Purchase Orders List</div>
                  <div class="product-count">{{ purchaseOrders.length }} Orders</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Supplier</th>
                        <th>Destination Warehouse</th>
                        <th>Items Count</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (po of purchaseOrders; track po.id) {
                        <tr>
                          <td><span class="sku">{{ po.poNumber }}</span></td>
                          <td><strong>{{ po.supplier?.name }}</strong></td>
                          <td>{{ po.warehouse?.name }}</td>
                          <td>{{ po.items?.length || 0 }} item(s)</td>
                          <td><strong>₹{{ po.totalAmount | number: '1.2-2' }}</strong></td>
                          <td>
                            @if (po.status === 'PENDING') {
                              <span class="badge badge-warning">PENDING</span>
                            } @else if (po.status === 'APPROVED') {
                              <span class="badge badge-info">APPROVED</span>
                            } @else if (po.status === 'RECEIVED') {
                              <span class="badge badge-success">RECEIVED</span>
                            } @else {
                              <span class="badge badge-danger">CANCELLED</span>
                            }
                          </td>
                          <td>{{ po.createdBy }}</td>
                          <td>{{ po.createdAt | date: 'short' }}</td>
                          <td>
                            <button class="small-btn" (click)="viewPODetails(po)">Details</button>
                            @if (po.status === 'PENDING') {
                              <button class="small-btn approve-btn" (click)="updatePOStatus(po.id, 'APPROVED')">Approve</button>
                              <button class="delete-btn" (click)="updatePOStatus(po.id, 'CANCELLED')">Cancel</button>
                            } @else if (po.status === 'APPROVED') {
                              <button class="small-btn receive-btn" (click)="updatePOStatus(po.id, 'RECEIVED')">Receive</button>
                              <button class="delete-btn" (click)="updatePOStatus(po.id, 'CANCELLED')">Cancel</button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="9" class="empty-state">No purchase orders found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 7. SALES ORDERS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'orders') {
            @if (loading) {
              <div class="loading">Loading sales orders...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">Sales Orders & Fulfillment</div>
                  <div class="product-count">{{ orders.length }} Orders</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Fulfillment Warehouse</th>
                        <th>Items Count</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of orders; track order.id) {
                        <tr>
                          <td><span class="sku">{{ order.orderNumber }}</span></td>
                          <td><strong>{{ order.customerName }}</strong></td>
                          <td>{{ order.customerEmail }}</td>
                          <td>{{ order.warehouse?.name }}</td>
                          <td>{{ order.items?.length || 0 }} item(s)</td>
                          <td><strong>₹{{ order.totalAmount | number: '1.2-2' }}</strong></td>
                          <td>
                            @if (order.status === 'PENDING') {
                              <span class="badge badge-warning">PENDING</span>
                            } @else if (order.status === 'COMPLETED') {
                              <span class="badge badge-success">COMPLETED</span>
                            } @else {
                              <span class="badge badge-danger">CANCELLED</span>
                            }
                          </td>
                          <td>{{ order.createdAt | date: 'short' }}</td>
                          <td>
                            <button class="small-btn" (click)="viewOrderDetails(order)">Details</button>
                            @if (order.status === 'PENDING') {
                              <button class="small-btn receive-btn" (click)="updateOrderStatus(order.id, 'COMPLETED')">Complete</button>
                              <button class="delete-btn" (click)="updateOrderStatus(order.id, 'CANCELLED')">Cancel</button>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="9" class="empty-state">No sales orders found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          <!-- ==================================================== -->
          <!-- 8. REPORTS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'reports') {
            @if (reportSummary) {
              <!-- KPI Summary Cards -->
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Total Inventory Valuation</div>
                  <div class="stat-value">₹{{ reportSummary.totalInventoryValuation | number: '1.2-2' }}</div>
                  <div class="stat-hint">Current asset value</div>
                </div>

                <div class="stat-card">
                  <div class="stat-label">Total Stock Quantity</div>
                  <div class="stat-value">{{ reportSummary.totalStockQuantity }}</div>
                  <div class="stat-hint">Units across facilities</div>
                </div>

                <div class="stat-card alert-stat">
                  <div class="stat-label">Low Stock Alerts</div>
                  <div class="stat-value alert-text">{{ reportSummary.lowStockCount }}</div>
                  <div class="stat-hint">Items below threshold</div>
                </div>

                <div class="stat-card">
                  <div class="stat-label">Total Sales Revenue</div>
                  <div class="stat-value">₹{{ reportSummary.totalSalesRevenue | number: '1.2-2' }}</div>
                  <div class="stat-hint">From completed orders</div>
                </div>
              </div>

              <!-- Low Stock Breakdown Table -->
              <div class="card" style="margin-top: 24px;">
                <div class="card-header-row">
                  <div class="card-title">⚠️ Low Stock Breakdown & Critical Replenishment</div>
                  <div class="product-count">{{ reportSummary.lowStockItems?.length || 0 }} Items</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Warehouse</th>
                        <th>Current Quantity</th>
                        <th>Reorder Level</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of reportSummary.lowStockItems; track item.id) {
                        <tr class="low-stock-row">
                          <td><strong>{{ item.product.name }}</strong></td>
                          <td><span class="sku">{{ item.product.sku }}</span></td>
                          <td>{{ item.warehouse.name }}</td>
                          <td><strong class="alert-text">{{ item.quantity }} {{ item.product.unit }}</strong></td>
                          <td>{{ item.product.reorderLevel }} {{ item.product.unit }}</td>
                          <td>
                            <button class="auto-reorder-btn" (click)="triggerAutoReorder(item)">⚡ Generate PO</button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="empty-state">All inventory levels are currently optimal.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Orders Breakdown -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px;">
                <div class="card">
                  <div class="card-title">Purchase Orders Summary</div>
                  <p style="color: #64748b; font-size: 14px;">Total POs: <strong>{{ reportSummary.totalPurchaseOrders }}</strong> | Total Spent: <strong>₹{{ reportSummary.totalPOSpent | number: '1.2-2' }}</strong></p>
                  <div class="table-wrapper" style="margin-top: 12px;">
                    <table>
                      <thead>
                        <tr><th>Status</th><th>Count</th></tr>
                      </thead>
                      <tbody>
                        @for (entry of getObjectEntries(reportSummary.poStatusBreakdown); track entry.key) {
                          <tr>
                            <td><span class="badge badge-info">{{ entry.key }}</span></td>
                            <td><strong>{{ entry.value }}</strong></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="card">
                  <div class="card-title">Sales Orders Summary</div>
                  <p style="color: #64748b; font-size: 14px;">Total Orders: <strong>{{ reportSummary.totalSalesOrders }}</strong> | Total Revenue: <strong>₹{{ reportSummary.totalSalesRevenue | number: '1.2-2' }}</strong></p>
                  <div class="table-wrapper" style="margin-top: 12px;">
                    <table>
                      <thead>
                        <tr><th>Status</th><th>Count</th></tr>
                      </thead>
                      <tbody>
                        @for (entry of getObjectEntries(reportSummary.orderStatusBreakdown); track entry.key) {
                          <tr>
                            <td><span class="badge badge-success">{{ entry.key }}</span></td>
                            <td><strong>{{ entry.value }}</strong></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } @else {
              <div class="loading">Generating reports...</div>
            }

          <!-- ==================================================== -->
          <!-- 9. AUDIT LOGS PAGE -->
          <!-- ==================================================== -->
          } @else if (currentPage === 'audit-logs') {
            <div class="search-row">
              <input
                type="text"
                placeholder="Search audit trail by user, action, or details..."
                class="search-input"
                [(ngModel)]="auditSearchText"
                (input)="filterAuditLogs()"
              />
            </div>

            @if (loading) {
              <div class="loading">Loading audit logs...</div>
            } @else {
              <div class="card">
                <div class="card-header-row">
                  <div class="card-title">System Audit Trail & Event Logs</div>
                  <div class="product-count">{{ filteredAuditLogs.length }} Events</div>
                </div>

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User Email</th>
                        <th>Action</th>
                        <th>Target Entity</th>
                        <th>Entity ID</th>
                        <th>Detailed Log</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (log of filteredAuditLogs; track log.id) {
                        <tr>
                          <td>{{ log.timestamp | date: 'medium' }}</td>
                          <td><strong>{{ log.userEmail }}</strong></td>
                          <td><span class="action-tag">{{ log.action }}</span></td>
                          <td>{{ log.entityName }}</td>
                          <td>#{{ log.entityId }}</td>
                          <td>{{ log.details }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="empty-state">No audit logs found.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }
        </section>
      </main>
    </div>

    <!-- ==================================================== -->
    <!-- MODALS SECTION -->
    <!-- ==================================================== -->

    <!-- STOCK ADJUSTMENT MODAL -->
    @if (showAdjustModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Stock Adjustment</h2>
              <p>Increase (Stock In) or Decrease (Stock Out) warehouse inventory.</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitAdjustStock()">
            <div class="form-grid">
              <label>
                Product *
                <select [(ngModel)]="adjustForm.productId" name="adjustProduct" required>
                  <option [ngValue]="null">Select Product</option>
                  @for (p of products; track p.id) {
                    <option [value]="p.id">{{ p.name }} (SKU: {{ p.sku }})</option>
                  }
                </select>
              </label>

              <label>
                Warehouse *
                <select [(ngModel)]="adjustForm.warehouseId" name="adjustWarehouse" required>
                  <option [ngValue]="null">Select Warehouse</option>
                  @for (wh of warehouses; track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </label>

              <label>
                Adjustment Type *
                <select [(ngModel)]="adjustForm.type" name="adjustType" required>
                  <option value="INCREASE">INCREASE (Stock In)</option>
                  <option value="DECREASE">DECREASE (Stock Out)</option>
                </select>
              </label>

              <label>
                Quantity *
                <input type="number" min="1" [(ngModel)]="adjustForm.quantity" name="adjustQty" required />
              </label>

              <label class="full">
                Reason / Note
                <input type="text" [(ngModel)]="adjustForm.reason" name="adjustReason" placeholder="e.g. Shipment intake, damaged items, audit count" />
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Saving...' : 'Apply Adjustment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- STOCK TRANSFER MODAL -->
    @if (showTransferModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Inter-Warehouse Stock Transfer</h2>
              <p>Move inventory from one warehouse location to another.</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitTransferStock()">
            <div class="form-grid">
              <label class="full">
                Product *
                <select [(ngModel)]="transferForm.productId" name="transferProduct" required>
                  <option [ngValue]="null">Select Product</option>
                  @for (p of products; track p.id) {
                    <option [value]="p.id">{{ p.name }} (SKU: {{ p.sku }})</option>
                  }
                </select>
              </label>

              <label>
                Source Warehouse (From) *
                <select [(ngModel)]="transferForm.fromWarehouseId" name="transferFrom" required>
                  <option [ngValue]="null">Select Source Warehouse</option>
                  @for (wh of warehouses; track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </label>

              <label>
                Destination Warehouse (To) *
                <select [(ngModel)]="transferForm.toWarehouseId" name="transferTo" required>
                  <option [ngValue]="null">Select Destination Warehouse</option>
                  @for (wh of warehouses; track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </label>

              <label>
                Transfer Quantity *
                <input type="number" min="1" [(ngModel)]="transferForm.quantity" name="transferQty" required />
              </label>

              <label>
                Transfer Reason
                <input type="text" [(ngModel)]="transferForm.reason" name="transferReason" placeholder="e.g. Stock balancing, regional demand" />
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Transferring...' : 'Execute Transfer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- WAREHOUSE MODAL (ADD / EDIT) -->
    @if (showWarehouseModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>{{ editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse' }}</h2>
              <p>Configure warehouse details and capacity.</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitWarehouseForm()">
            <div class="form-grid">
              <label>
                Warehouse Code *
                <input type="text" [(ngModel)]="warehouseForm.code" name="whCode" placeholder="e.g. WH-NORTH" required />
              </label>

              <label>
                Facility Name *
                <input type="text" [(ngModel)]="warehouseForm.name" name="whName" placeholder="e.g. North Distribution Hub" required />
              </label>

              <label>
                Location *
                <input type="text" [(ngModel)]="warehouseForm.location" name="whLocation" placeholder="e.g. Chicago, IL" required />
              </label>

              <label>
                Facility Manager
                <input type="text" [(ngModel)]="warehouseForm.manager" name="whManager" placeholder="e.g. David Miller" />
              </label>

              <label>
                Storage Capacity (units)
                <input type="number" min="1" [(ngModel)]="warehouseForm.capacity" name="whCapacity" />
              </label>

              <label class="full">
                Full Address
                <input type="text" [(ngModel)]="warehouseForm.address" name="whAddress" placeholder="e.g. 100 Logistics Blvd, Chicago, IL" />
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Saving...' : 'Save Warehouse' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- SUPPLIER MODAL (ADD / EDIT) -->
    @if (showSupplierModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>{{ editingSupplier ? 'Edit Supplier' : 'Add New Supplier' }}</h2>
              <p>Manage external vendor information.</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitSupplierForm()">
            <div class="form-grid">
              <label>
                Supplier / Company Name *
                <input type="text" [(ngModel)]="supplierForm.name" name="supName" placeholder="e.g. TechGlobal Logistics" required />
              </label>

              <label>
                Contact Person *
                <input type="text" [(ngModel)]="supplierForm.contactPerson" name="supContact" placeholder="e.g. Alex Turner" required />
              </label>

              <label>
                Email Address *
                <input type="email" [(ngModel)]="supplierForm.email" name="supEmail" placeholder="e.g. vendor@company.com" required />
              </label>

              <label>
                Phone Number *
                <input type="text" [(ngModel)]="supplierForm.phone" name="supPhone" placeholder="e.g. +1-555-0199" required />
              </label>

              <label class="full">
                Street Address
                <input type="text" [(ngModel)]="supplierForm.address" name="supAddress" placeholder="e.g. 123 Silicon Ave, San Jose, CA" />
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Saving...' : 'Save Supplier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- CREATE PURCHASE ORDER MODAL -->
    @if (showCreatePOModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Create Purchase Order</h2>
              <p>Procure inventory items from an authorized supplier.</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitCreatePO()">
            <div class="form-grid">
              <label>
                Supplier *
                <select [(ngModel)]="poForm.supplierId" name="poSupplier" required>
                  <option [ngValue]="null">Select Supplier</option>
                  @for (s of suppliers; track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
                  }
                </select>
              </label>

              <label>
                Destination Warehouse *
                <select [(ngModel)]="poForm.warehouseId" name="poWarehouse" required>
                  <option [ngValue]="null">Select Warehouse</option>
                  @for (wh of warehouses; track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </label>

              <label class="full">
                PO Notes / Reference
                <input type="text" [(ngModel)]="poForm.notes" name="poNotes" placeholder="e.g. Urgent Q4 restocking" />
              </label>
            </div>

            <!-- Items Table -->
            <div style="margin-top: 20px;">
              <div class="card-header-row">
                <h3>Order Items</h3>
                <button type="button" class="small-btn" (click)="addPOLineItem()">+ Add Item</button>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product *</th>
                      <th style="width: 120px;">Quantity *</th>
                      <th style="width: 150px;">Unit Price (₹)</th>
                      <th style="width: 150px;">Subtotal (₹)</th>
                      <th style="width: 80px;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of poForm.items; track $index) {
                      <tr>
                        <td>
                          <select [(ngModel)]="item.productId" [name]="'poProd' + $index" (change)="onPOProductChange(item)" required>
                            <option [ngValue]="null">Select Product</option>
                            @for (p of products; track p.id) {
                              <option [value]="p.id">{{ p.name }} (Cost: ₹{{ p.costPrice }})</option>
                            }
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" [(ngModel)]="item.quantity" [name]="'poQty' + $index" (input)="calcPOTotals()" required />
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" [(ngModel)]="item.unitPrice" [name]="'poPrice' + $index" (input)="calcPOTotals()" required />
                        </td>
                        <td>
                          <strong>₹{{ (item.quantity * item.unitPrice) | number: '1.2-2' }}</strong>
                        </td>
                        <td>
                          <button type="button" class="delete-btn" (click)="removePOLineItem($index)" [disabled]="poForm.items.length <= 1">×</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                Total PO Amount: <strong style="color: #2563eb;">₹{{ poTotalAmount | number: '1.2-2' }}</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Creating...' : 'Create Purchase Order' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- VIEW PURCHASE ORDER DETAILS MODAL -->
    @if (selectedPODetails) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Purchase Order {{ selectedPODetails.poNumber }}</h2>
              <p>Supplier: <strong>{{ selectedPODetails.supplier?.name }}</strong> | Warehouse: <strong>{{ selectedPODetails.warehouse?.name }}</strong></p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <div style="margin: 15px 0;">
            <div style="display: flex; gap: 20px; font-size: 14px; color: #64748b;">
              <div>Status: <strong>{{ selectedPODetails.status }}</strong></div>
              <div>Created By: <strong>{{ selectedPODetails.createdBy }}</strong></div>
              <div>Created: <strong>{{ selectedPODetails.createdAt | date: 'medium' }}</strong></div>
            </div>
            @if (selectedPODetails.notes) {
              <p style="margin-top: 8px; font-style: italic;">Notes: {{ selectedPODetails.notes }}</p>
            }
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of selectedPODetails.items; track item.id) {
                  <tr>
                    <td><strong>{{ item.product?.name }}</strong></td>
                    <td><span class="sku">{{ item.product?.sku }}</span></td>
                    <td>{{ item.quantity }} {{ item.product?.unit }}</td>
                    <td>₹{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td><strong>₹{{ item.subtotal | number: '1.2-2' }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div style="text-align: right; margin-top: 15px; font-size: 18px;">
            Total PO Value: <strong style="color: #2563eb;">₹{{ selectedPODetails.totalAmount | number: '1.2-2' }}</strong>
          </div>

          <div class="modal-actions">
            @if (selectedPODetails.status === 'PENDING') {
              <button class="primary-btn approve-btn" (click)="updatePOStatus(selectedPODetails.id, 'APPROVED')">Approve Order</button>
              <button class="delete-btn" (click)="updatePOStatus(selectedPODetails.id, 'CANCELLED')">Cancel Order</button>
            } @else if (selectedPODetails.status === 'APPROVED') {
              <button class="primary-btn receive-btn" (click)="updatePOStatus(selectedPODetails.id, 'RECEIVED')">Mark as Received (Intake Stock)</button>
              <button class="delete-btn" (click)="updatePOStatus(selectedPODetails.id, 'CANCELLED')">Cancel Order</button>
            }
            <button type="button" class="secondary-btn" (click)="closeModals()">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- CREATE SALES ORDER MODAL -->
    @if (showCreateOrderModal) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Create Sales Order</h2>
              <p>Create customer order (inventory will automatically be validated and deducted).</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <form (ngSubmit)="submitCreateOrder()">
            <div class="form-grid">
              <label>
                Customer Name *
                <input type="text" [(ngModel)]="orderForm.customerName" name="orderCustomer" placeholder="e.g. Acme Corp" required />
              </label>

              <label>
                Customer Email *
                <input type="email" [(ngModel)]="orderForm.customerEmail" name="orderEmail" placeholder="e.g. orders@acme.com" required />
              </label>

              <label>
                Fulfillment Warehouse *
                <select [(ngModel)]="orderForm.warehouseId" name="orderWarehouse" required>
                  <option [ngValue]="null">Select Warehouse</option>
                  @for (wh of warehouses; track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </label>

              <label>
                Order Notes
                <input type="text" [(ngModel)]="orderForm.notes" name="orderNotes" placeholder="e.g. Priority courier" />
              </label>
            </div>

            <!-- Items Table -->
            <div style="margin-top: 20px;">
              <div class="card-header-row">
                <h3>Order Items</h3>
                <button type="button" class="small-btn" (click)="addOrderLineItem()">+ Add Item</button>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product *</th>
                      <th style="width: 120px;">Quantity *</th>
                      <th style="width: 150px;">Unit Price (₹)</th>
                      <th style="width: 150px;">Subtotal (₹)</th>
                      <th style="width: 80px;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of orderForm.items; track $index) {
                      <tr>
                        <td>
                          <select [(ngModel)]="item.productId" [name]="'ordProd' + $index" (change)="onOrderProductChange(item)" required>
                            <option [ngValue]="null">Select Product</option>
                            @for (p of products; track p.id) {
                              <option [value]="p.id">{{ p.name }} (Price: ₹{{ p.price }})</option>
                            }
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" [(ngModel)]="item.quantity" [name]="'ordQty' + $index" (input)="calcOrderTotals()" required />
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" [(ngModel)]="item.unitPrice" [name]="'ordPrice' + $index" (input)="calcOrderTotals()" required />
                        </td>
                        <td>
                          <strong>₹{{ (item.quantity * item.unitPrice) | number: '1.2-2' }}</strong>
                        </td>
                        <td>
                          <button type="button" class="delete-btn" (click)="removeOrderLineItem($index)" [disabled]="orderForm.items.length <= 1">×</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                Total Order Revenue: <strong style="color: #10b981;">₹{{ orderTotalAmount | number: '1.2-2' }}</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-btn" (click)="closeModals()">Cancel</button>
              <button type="submit" class="primary-btn" [disabled]="modalLoading">
                {{ modalLoading ? 'Creating...' : 'Submit Sales Order' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- VIEW SALES ORDER DETAILS MODAL -->
    @if (selectedOrderDetails) {
      <div class="modal-backdrop" (click)="closeModals()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>Sales Order {{ selectedOrderDetails.orderNumber }}</h2>
              <p>Customer: <strong>{{ selectedOrderDetails.customerName }}</strong> ({{ selectedOrderDetails.customerEmail }})</p>
            </div>
            <button class="close-btn" (click)="closeModals()">×</button>
          </div>

          <div style="margin: 15px 0;">
            <div style="display: flex; gap: 20px; font-size: 14px; color: #64748b;">
              <div>Status: <strong>{{ selectedOrderDetails.status }}</strong></div>
              <div>Warehouse: <strong>{{ selectedOrderDetails.warehouse?.name }}</strong></div>
              <div>Created: <strong>{{ selectedOrderDetails.createdAt | date: 'medium' }}</strong></div>
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of selectedOrderDetails.items; track item.id) {
                  <tr>
                    <td><strong>{{ item.product?.name }}</strong></td>
                    <td><span class="sku">{{ item.product?.sku }}</span></td>
                    <td>{{ item.quantity }} {{ item.product?.unit }}</td>
                    <td>₹{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td><strong>₹{{ item.subtotal | number: '1.2-2' }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div style="text-align: right; margin-top: 15px; font-size: 18px;">
            Total Order Amount: <strong style="color: #10b981;">₹{{ selectedOrderDetails.totalAmount | number: '1.2-2' }}</strong>
          </div>

          <div class="modal-actions">
            @if (selectedOrderDetails.status === 'PENDING') {
              <button class="primary-btn receive-btn" (click)="updateOrderStatus(selectedOrderDetails.id, 'COMPLETED')">Mark Completed</button>
              <button class="delete-btn" (click)="updateOrderStatus(selectedOrderDetails.id, 'CANCELLED')">Cancel Order (Restore Stock)</button>
            }
            <button type="button" class="secondary-btn" (click)="closeModals()">Close</button>
          </div>
        </div>
      </div>
    }
  `,

  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      * {
        box-sizing: border-box;
      }

      .app-shell {
        min-height: 100vh;
        display: flex;
        background: #f4f7fb;
        color: #172033;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      }

      .sidebar {
        width: 250px;
        min-height: 100vh;
        background: #111827;
        color: white;
        padding: 24px 16px;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 100;
        overflow-y: auto;
      }

      .logo {
        font-size: 21px;
        font-weight: 700;
        padding: 8px 12px 28px;
        letter-spacing: -0.5px;
      }

      .logo span {
        color: #3b82f6;
      }

      .nav-menu {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .nav-item {
        padding: 12px 14px;
        border-radius: 8px;
        color: #9ca3af;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.15s ease;
      }

      .nav-item:hover {
        background: #1f2937;
        color: #ffffff;
      }

      .nav-item.active {
        background: #2563eb;
        color: #ffffff;
        font-weight: 600;
      }

      .main-content {
        margin-left: 250px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .topbar {
        height: 64px;
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        position: sticky;
        top: 0;
        z-index: 90;
      }

      .page-title {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
      }

      .user-menu-container {
        position: relative;
      }

      .user-profile-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: 1px solid transparent;
        padding: 4px 8px 4px 12px;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .user-profile-trigger:hover {
        background: #f8fafc;
        border-color: #e2e8f0;
      }

      .role-badge {
        background: #eff6ff;
        color: #2563eb;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid #bfdbfe;
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #4b5563;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 15px;
      }

      .dropdown-arrow {
        font-size: 11px;
        color: #94a3b8;
        transition: transform 0.2s ease;
      }

      .dropdown-arrow.open {
        transform: rotate(180deg);
      }

      .profile-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 250px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        padding: 12px;
        z-index: 1000;
      }

      .profile-dropdown-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 6px 10px;
      }

      .avatar-lg {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
      }

      .user-meta {
        overflow: hidden;
      }

      .header-name {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .header-email {
        font-size: 12px;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dropdown-divider {
        height: 1px;
        background: #f1f5f9;
        margin: 6px 0;
      }

      .menu-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .menu-item-info {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 6px;
        background: #f8fafc;
      }

      .menu-icon {
        font-size: 16px;
      }

      .menu-text {
        display: flex;
        flex-direction: column;
        font-size: 12px;
      }

      .menu-title {
        color: #64748b;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .menu-sub {
        color: #1e293b;
        font-weight: 600;
        font-size: 13px;
      }

      .role-highlight {
        color: #2563eb;
      }

      .menu-logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: none;
        background: transparent;
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .menu-logout-btn:hover {
        background: #fee2e2;
      }

      .content {
        padding: 32px;
        flex: 1;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0 0 6px;
        font-size: 26px;
        font-weight: 700;
        color: #111827;
      }

      .page-header p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }

      .primary-btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .primary-btn:hover {
        background: #1d4ed8;
      }

      .secondary-btn {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .secondary-btn:hover {
        background: #f3f4f6;
      }

      .success-box {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 12px 18px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
      }

      .error-box {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 12px 18px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
      }

      .box-close {
        background: transparent;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px;
      }

      .stat-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 22px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .stat-label {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 800;
        color: #111827;
        margin: 10px 0 6px;
      }

      .stat-hint {
        font-size: 12px;
        color: #2563eb;
        font-weight: 500;
      }

      .alert-stat {
        border-left: 4px solid #ef4444;
      }

      .alert-text {
        color: #dc2626 !important;
      }

      .card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }

      .card-title {
        font-size: 17px;
        font-weight: 700;
        color: #111827;
      }

      .product-count {
        background: #f3f4f6;
        color: #4b5563;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
      }

      .search-row {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        align-items: center;
      }

      .search-input {
        flex: 1;
        height: 42px;
        padding: 0 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        background: white;
      }

      .filter-select {
        height: 42px;
        padding: 0 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      th {
        text-align: left;
        padding: 12px 14px;
        background: #f9fafb;
        color: #4b5563;
        font-weight: 600;
        border-bottom: 1px solid #e5e7eb;
      }

      td {
        padding: 14px;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f9fafb;
      }

      .product-name {
        font-weight: 600;
        color: #111827;
      }

      .product-description {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }

      .sku {
        font-family: monospace;
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        color: #374151;
      }

      .badge {
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .badge-success { background: #dcfce7; color: #15803d; }
      .badge-warning { background: #fef3c7; color: #b45309; }
      .badge-danger { background: #fee2e2; color: #b91c1c; }
      .badge-info { background: #e0f2fe; color: #0369a1; }

      .action-tag {
        font-size: 11px;
        font-weight: 700;
        background: #f1f5f9;
        color: #334155;
        padding: 3px 7px;
        border-radius: 4px;
        font-family: monospace;
      }

      .small-btn {
        border: none;
        background: #eff6ff;
        color: #2563eb;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        margin-right: 6px;
      }

      .small-btn:hover {
        background: #dbeafe;
      }

      .approve-btn {
        background: #e0f2fe;
        color: #0284c7;
      }

      .approve-btn:hover { background: #bae6fd; }

      .receive-btn {
        background: #dcfce7;
        color: #16a34a;
      }

      .receive-btn:hover { background: #bbf7d0; }

      .auto-reorder-btn {
        background: #fef3c7;
        color: #d97706;
        border: 1px solid #fde68a;
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        margin-right: 6px;
        transition: all 0.15s ease;
      }

      .auto-reorder-btn:hover {
        background: #fde68a;
        color: #b45309;
      }

      .delete-btn {
        border: none;
        background: #fee2e2;
        color: #dc2626;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
      }

      .delete-btn:hover {
        background: #fecaca;
      }

      .low-stock-row {
        background: #fffbeb !important;
      }

      .loading, .empty-state {
        text-align: center;
        padding: 48px;
        color: #6b7280;
        font-size: 15px;
      }

      /* MODAL STYLES */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
      }

      .modal {
        background: white;
        border-radius: 14px;
        width: 100%;
        max-width: 580px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 28px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }

      .modal-large {
        max-width: 820px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-header h2 {
        margin: 0 0 4px;
        font-size: 20px;
        color: #111827;
      }

      .modal-header p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
      }

      .close-btn {
        background: transparent;
        border: none;
        font-size: 24px;
        color: #9ca3af;
        cursor: pointer;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .full {
        grid-column: 1 / -1;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }

      input, select, textarea {
        height: 40px;
        padding: 0 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        background: white;
      }

      textarea {
        height: auto;
        padding: 10px 12px;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }
    `,
  ],
})
export class PageComponent {
  title = 'Dashboard';
  description = 'Overview of your retail inventory.';
  currentPage = 'dashboard';

  userName = 'Administrator';
  userEmail = 'admin@retail.com';
  userRole = 'ADMIN';
  showProfileMenu = false;

  loading = false;
  modalLoading = false;
  successMessage = '';
  errorMessage = '';

  // Data collections
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  warehouses: any[] = [];
  suppliers: any[] = [];
  inventoryItems: any[] = [];
  filteredInventory: any[] = [];
  purchaseOrders: any[] = [];
  orders: any[] = [];
  reportSummary: any = null;
  auditLogs: any[] = [];
  filteredAuditLogs: any[] = [];

  // Filter states
  searchText = '';
  statusFilter = 'all';
  selectedInventoryWarehouseId = 0;
  showLowStockOnly = false;
  auditSearchText = '';

  // Modals visibility
  showProductForm = false;
  editingProduct: any = null;

  showAdjustModal = false;
  adjustForm = {
    productId: null as number | null,
    warehouseId: null as number | null,
    type: 'INCREASE',
    quantity: 10,
    reason: '',
  };

  showTransferModal = false;
  transferForm = {
    productId: null as number | null,
    fromWarehouseId: null as number | null,
    toWarehouseId: null as number | null,
    quantity: 5,
    reason: '',
  };

  showWarehouseModal = false;
  editingWarehouse: any = null;
  warehouseForm = {
    code: '',
    name: '',
    location: '',
    address: '',
    capacity: 10000,
    manager: '',
  };

  showSupplierModal = false;
  editingSupplier: any = null;
  supplierForm = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  };

  showCreatePOModal = false;
  poForm = {
    supplierId: null as number | null,
    warehouseId: null as number | null,
    notes: '',
    items: [] as { productId: number | null; quantity: number; unitPrice: number }[],
  };
  poTotalAmount = 0;
  selectedPODetails: any = null;

  showCreateOrderModal = false;
  orderForm = {
    customerName: '',
    customerEmail: '',
    warehouseId: null as number | null,
    notes: '',
    items: [] as { productId: number | null; quantity: number; unitPrice: number }[],
  };
  orderTotalAmount = 0;
  selectedOrderDetails: any = null;

  dashboardStats = {
    totalProducts: 0,
    totalInventory: 0,
    totalOrders: 0,
    totalWarehouses: 0,
    lowStockProducts: 0,
    pendingPurchaseOrders: 0,
    recentActivities: [] as any[],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    this.userName = localStorage.getItem('userName') || 'Administrator';
    this.userEmail = localStorage.getItem('userEmail') || 'admin@retail.com';
    this.userRole = localStorage.getItem('userRole') || 'ADMIN';

    this.route.url.subscribe((url) => {
      const page = url[0]?.path || 'dashboard';
      this.currentPage = page;
      this.setPageMetadata(page);
      this.loadPageData(page);
    });
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showProfileMenu) {
      this.showProfileMenu = false;
    }
  }

  hasRole(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.userRole);
  }

  get formattedRoleName(): string {
    switch (this.userRole) {
      case 'ADMIN': return 'Administrator';
      case 'WAREHOUSE_MANAGER': return 'Warehouse Manager';
      case 'STORE_MANAGER': return 'Store Manager';
      case 'SUPPLIER': return 'Supplier';
      default: return this.userRole || 'User';
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private setPageMetadata(page: string): void {
    const meta: Record<string, { title: string; description: string }> = {
      dashboard: { title: 'Dashboard', description: 'Real-time overview of inventory, stock alerts, and recent activities.' },
      products: { title: 'Product Catalog', description: 'Manage products, SKUs, pricing, categories, and reorder levels.' },
      inventory: { title: 'Inventory Management', description: 'Stock levels across warehouses, adjustments, transfers, and auto-reorder.' },
      warehouses: { title: 'Warehouse Management', description: 'Manage distribution hubs, locations, and capacity allocation.' },
      suppliers: { title: 'Supplier Directory', description: 'Manage external vendor profiles, contacts, and procurement channels.' },
      'purchase-orders': { title: 'Purchase Orders', description: 'Procure inventory items, track delivery lifecycle, and receive stock.' },
      orders: { title: 'Sales Orders', description: 'Process customer sales orders with automated inventory deduction.' },
      reports: { title: 'Reports & Analytics', description: 'Valuation summaries, low-stock breakdown, and revenue analytics.' },
      'audit-logs': { title: 'Audit Trail & Logs', description: 'Traceable history of all user actions and system changes.' },
    };

    const selected = meta[page] || meta['dashboard'];
    this.title = selected.title;
    this.description = selected.description;
  }

  private loadPageData(page: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Always ensure background reference datasets are available
    this.loadCommonDependencies();

    if (page === 'dashboard') this.loadDashboardStats();
    if (page === 'products') this.loadProducts();
    if (page === 'inventory') this.loadInventory();
    if (page === 'warehouses') this.loadWarehouses();
    if (page === 'suppliers') this.loadSuppliers();
    if (page === 'purchase-orders') this.loadPurchaseOrders();
    if (page === 'orders') this.loadOrders();
    if (page === 'reports') this.loadReports();
    if (page === 'audit-logs') this.loadAuditLogs();
  }

  private async loadCommonDependencies(): Promise<void> {
    if (this.warehouses.length === 0 && this.hasRole(['ADMIN', 'WAREHOUSE_MANAGER'])) {
      this.api.get<any[]>('/warehouses').then(data => { this.warehouses = data; this.cdr.detectChanges(); }).catch(() => {});
    }
    if (this.products.length === 0 && this.hasRole(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER'])) {
      this.api.get<any[]>('/products').then(data => { this.products = data; this.cdr.detectChanges(); }).catch(() => {});
    }
    if (this.suppliers.length === 0 && this.hasRole(['ADMIN', 'SUPPLIER', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'])) {
      this.api.get<any[]>('/suppliers').then(data => { this.suppliers = data; this.cdr.detectChanges(); }).catch(() => {});
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  getObjectEntries(obj: any): { key: string; value: any }[] {
    if (!obj) return [];
    return Object.keys(obj).map(k => ({ key: k, value: obj[k] }));
  }

  closeModals(): void {
    this.showProductForm = false;
    this.editingProduct = null;
    this.showAdjustModal = false;
    this.showTransferModal = false;
    this.showWarehouseModal = false;
    this.editingWarehouse = null;
    this.showSupplierModal = false;
    this.editingSupplier = null;
    this.showCreatePOModal = false;
    this.selectedPODetails = null;
    this.showCreateOrderModal = false;
    this.selectedOrderDetails = null;
    this.modalLoading = false;
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  async loadDashboardStats(): Promise<void> {
    try {
      this.dashboardStats = await this.api.get<any>('/dashboard/stats');
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Dashboard load failed:', err);
    }
  }

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================
  async loadProducts(): Promise<void> {
    this.loading = true;
    try {
      this.products = await this.api.get<Product[]>('/products');
      this.filteredProducts = [...this.products];
      this.categories = await this.api.get<any[]>('/products/categories');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load products.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  filterProducts(): void {
    const search = this.searchText.trim().toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        (p.category && p.category.name.toLowerCase().includes(search));
      const matchStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && p.active) ||
        (this.statusFilter === 'inactive' && !p.active);
      return matchSearch && matchStatus;
    });
  }

  openAddProduct(): void {
    this.editingProduct = null;
    this.showProductForm = true;
  }

  openEditProduct(product: any): void {
    this.editingProduct = product;
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
  }

  onProductSaved(saved: any): void {
    this.closeProductForm();
    this.successMessage = `Product "${saved.name}" saved successfully.`;
    this.loadProducts();
  }

  deleteProduct(product: any): void {
    if (!confirm(`Are you sure you want to deactivate product "${product.name}"?`)) return;
    this.api.delete(`/products/${product.id}`)
      .then(() => {
        this.successMessage = `Product "${product.name}" deactivated.`;
        this.loadProducts();
      })
      .catch((err: any) => {
        this.errorMessage = err.message || 'Failed to delete product.';
      });
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================
  async loadInventory(): Promise<void> {
    this.loading = true;
    try {
      this.inventoryItems = await this.api.get<any[]>('/inventory');
      this.filterInventory();
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load inventory.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  filterInventory(): void {
    let list = [...this.inventoryItems];
    if (this.selectedInventoryWarehouseId && Number(this.selectedInventoryWarehouseId) !== 0) {
      list = list.filter(i => i.warehouse && i.warehouse.id === Number(this.selectedInventoryWarehouseId));
    }
    if (this.showLowStockOnly) {
      list = list.filter(i => i.quantity <= i.product.reorderLevel);
    }
    this.filteredInventory = list;
    this.cdr.detectChanges();
  }

  openAdjustModal(): void {
    this.adjustForm = {
      productId: this.products[0]?.id || null,
      warehouseId: this.warehouses[0]?.id || null,
      type: 'INCREASE',
      quantity: 10,
      reason: '',
    };
    this.showAdjustModal = true;
  }

  openQuickAdjust(item: any): void {
    this.adjustForm = {
      productId: item.product.id,
      warehouseId: item.warehouse.id,
      type: 'INCREASE',
      quantity: item.product.reorderLevel || 10,
      reason: 'Quick stock replenishment',
    };
    this.showAdjustModal = true;
  }

  async submitAdjustStock(): Promise<void> {
    if (!this.adjustForm.productId || !this.adjustForm.warehouseId || this.adjustForm.quantity <= 0) {
      this.errorMessage = 'Please provide valid product, warehouse, and quantity > 0.';
      return;
    }
    this.modalLoading = true;
    try {
      await this.api.post('/inventory/adjust', this.adjustForm);
      this.successMessage = 'Stock adjustment applied successfully!';
      this.closeModals();
      this.loadInventory();
    } catch (err: any) {
      this.errorMessage = err.message || 'Stock adjustment failed.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  openTransferModal(): void {
    this.transferForm = {
      productId: this.products[0]?.id || null,
      fromWarehouseId: this.warehouses[0]?.id || null,
      toWarehouseId: this.warehouses[1]?.id || null,
      quantity: 5,
      reason: '',
    };
    this.showTransferModal = true;
  }

  async submitTransferStock(): Promise<void> {
    if (!this.transferForm.productId || !this.transferForm.fromWarehouseId || !this.transferForm.toWarehouseId) {
      this.errorMessage = 'Please select product, source warehouse, and destination warehouse.';
      return;
    }
    if (this.transferForm.fromWarehouseId === this.transferForm.toWarehouseId) {
      this.errorMessage = 'Source and destination warehouses cannot be the same.';
      return;
    }
    this.modalLoading = true;
    try {
      await this.api.post('/inventory/transfer', this.transferForm);
      this.successMessage = 'Stock transferred successfully between warehouses!';
      this.closeModals();
      this.loadInventory();
    } catch (err: any) {
      this.errorMessage = err.message || 'Stock transfer failed.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  async triggerAutoReorder(item: any): Promise<void> {
    try {
      const defaultSupplier = this.suppliers[0]?.id;
      const reorderQty = item.product.reorderLevel ? item.product.reorderLevel * 2 : 20;
      const res = await this.api.post<any>(
        `/purchase-orders/auto-reorder?productId=${item.product.id}&warehouseId=${item.warehouse.id}&supplierId=${defaultSupplier || 1}&quantity=${reorderQty}`,
        {}
      );
      this.successMessage = `⚡ Purchase Order ${res.poNumber} automatically generated for ${item.product.name} (Qty: ${reorderQty})!`;
      this.loadInventory();
      this.loadPurchaseOrders();
    } catch (err: any) {
      this.errorMessage = err.message || 'Auto-reorder failed.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // WAREHOUSE MANAGEMENT
  // ==========================================
  async loadWarehouses(): Promise<void> {
    this.loading = true;
    try {
      this.warehouses = await this.api.get<any[]>('/warehouses');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load warehouses.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openAddWarehouse(): void {
    this.editingWarehouse = null;
    this.warehouseForm = {
      code: '',
      name: '',
      location: '',
      address: '',
      capacity: 10000,
      manager: '',
    };
    this.showWarehouseModal = true;
  }

  openEditWarehouse(warehouse: any): void {
    this.editingWarehouse = warehouse;
    this.warehouseForm = {
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      address: warehouse.address,
      capacity: warehouse.capacity,
      manager: warehouse.manager,
    };
    this.showWarehouseModal = true;
  }

  async submitWarehouseForm(): Promise<void> {
    this.modalLoading = true;
    try {
      if (this.editingWarehouse) {
        await this.api.put(`/warehouses/${this.editingWarehouse.id}`, this.warehouseForm);
        this.successMessage = `Warehouse "${this.warehouseForm.name}" updated successfully.`;
      } else {
        await this.api.post('/warehouses', this.warehouseForm);
        this.successMessage = `Warehouse "${this.warehouseForm.name}" created successfully.`;
      }
      this.closeModals();
      this.loadWarehouses();
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to save warehouse.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  deleteWarehouse(warehouse: any): void {
    if (!confirm(`Are you sure you want to delete warehouse "${warehouse.name}"?`)) return;
    this.api.delete(`/warehouses/${warehouse.id}`)
      .then(() => {
        this.successMessage = `Warehouse "${warehouse.name}" deleted.`;
        this.loadWarehouses();
      })
      .catch((err: any) => {
        this.errorMessage = err.message || 'Failed to delete warehouse.';
      });
  }

  // ==========================================
  // SUPPLIER MANAGEMENT
  // ==========================================
  async loadSuppliers(): Promise<void> {
    this.loading = true;
    try {
      this.suppliers = await this.api.get<any[]>('/suppliers');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load suppliers.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openAddSupplier(): void {
    this.editingSupplier = null;
    this.supplierForm = {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    };
    this.showSupplierModal = true;
  }

  openEditSupplier(supplier: any): void {
    this.editingSupplier = supplier;
    this.supplierForm = {
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    };
    this.showSupplierModal = true;
  }

  async submitSupplierForm(): Promise<void> {
    this.modalLoading = true;
    try {
      if (this.editingSupplier) {
        await this.api.put(`/suppliers/${this.editingSupplier.id}`, this.supplierForm);
        this.successMessage = `Supplier "${this.supplierForm.name}" updated successfully.`;
      } else {
        await this.api.post('/suppliers', this.supplierForm);
        this.successMessage = `Supplier "${this.supplierForm.name}" created successfully.`;
      }
      this.closeModals();
      this.loadSuppliers();
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to save supplier.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  deleteSupplier(supplier: any): void {
    if (!confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) return;
    this.api.delete(`/suppliers/${supplier.id}`)
      .then(() => {
        this.successMessage = `Supplier "${supplier.name}" deleted.`;
        this.loadSuppliers();
      })
      .catch((err: any) => {
        this.errorMessage = err.message || 'Failed to delete supplier.';
      });
  }

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================
  async loadPurchaseOrders(): Promise<void> {
    this.loading = true;
    try {
      this.purchaseOrders = await this.api.get<any[]>('/purchase-orders');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load purchase orders.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openCreatePO(): void {
    this.poForm = {
      supplierId: this.suppliers[0]?.id || null,
      warehouseId: this.warehouses[0]?.id || null,
      notes: '',
      items: [
        {
          productId: this.products[0]?.id || null,
          quantity: 20,
          unitPrice: this.products[0]?.costPrice || 50,
        },
      ],
    };
    this.calcPOTotals();
    this.showCreatePOModal = true;
  }

  addPOLineItem(): void {
    this.poForm.items.push({
      productId: this.products[0]?.id || null,
      quantity: 10,
      unitPrice: this.products[0]?.costPrice || 50,
    });
    this.calcPOTotals();
  }

  removePOLineItem(index: number): void {
    if (this.poForm.items.length > 1) {
      this.poForm.items.splice(index, 1);
      this.calcPOTotals();
    }
  }

  onPOProductChange(item: any): void {
    const p = this.products.find(x => x.id === Number(item.productId));
    if (p) {
      item.unitPrice = p.costPrice || p.price;
    }
    this.calcPOTotals();
  }

  calcPOTotals(): void {
    this.poTotalAmount = this.poForm.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }

  async submitCreatePO(): Promise<void> {
    if (!this.poForm.supplierId || !this.poForm.warehouseId || this.poForm.items.length === 0) {
      this.errorMessage = 'Please complete supplier, warehouse, and line items.';
      return;
    }
    this.modalLoading = true;
    try {
      const res = await this.api.post<any>('/purchase-orders', this.poForm);
      this.successMessage = `Purchase Order ${res.poNumber} created successfully!`;
      this.closeModals();
      this.loadPurchaseOrders();
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to create purchase order.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  viewPODetails(po: any): void {
    this.selectedPODetails = po;
  }

  async updatePOStatus(poId: number, status: string): Promise<void> {
    try {
      const res = await this.api.put<any>(`/purchase-orders/${poId}/status`, { status });
      this.successMessage = `Purchase Order ${res.poNumber} updated to ${status}!`;
      this.closeModals();
      this.loadPurchaseOrders();
      this.loadInventory();
    } catch (err: any) {
      this.errorMessage = err.message || `Failed to update status to ${status}.`;
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // SALES ORDERS
  // ==========================================
  async loadOrders(): Promise<void> {
    this.loading = true;
    try {
      this.orders = await this.api.get<any[]>('/orders');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load sales orders.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openCreateOrder(): void {
    this.orderForm = {
      customerName: '',
      customerEmail: '',
      warehouseId: this.warehouses[0]?.id || null,
      notes: '',
      items: [
        {
          productId: this.products[0]?.id || null,
          quantity: 1,
          unitPrice: this.products[0]?.price || 100,
        },
      ],
    };
    this.calcOrderTotals();
    this.showCreateOrderModal = true;
  }

  addOrderLineItem(): void {
    this.orderForm.items.push({
      productId: this.products[0]?.id || null,
      quantity: 1,
      unitPrice: this.products[0]?.price || 100,
    });
    this.calcOrderTotals();
  }

  removeOrderLineItem(index: number): void {
    if (this.orderForm.items.length > 1) {
      this.orderForm.items.splice(index, 1);
      this.calcOrderTotals();
    }
  }

  onOrderProductChange(item: any): void {
    const p = this.products.find(x => x.id === Number(item.productId));
    if (p) {
      item.unitPrice = p.price;
    }
    this.calcOrderTotals();
  }

  calcOrderTotals(): void {
    this.orderTotalAmount = this.orderForm.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }

  async submitCreateOrder(): Promise<void> {
    if (!this.orderForm.customerName || !this.orderForm.warehouseId || this.orderForm.items.length === 0) {
      this.errorMessage = 'Please enter customer name, warehouse, and at least one item.';
      return;
    }
    this.modalLoading = true;
    try {
      const res = await this.api.post<any>('/orders', this.orderForm);
      this.successMessage = `Sales Order ${res.orderNumber} placed and stock deducted!`;
      this.closeModals();
      this.loadOrders();
      this.loadInventory();
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to place order.';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  viewOrderDetails(order: any): void {
    this.selectedOrderDetails = order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    try {
      const res = await this.api.put<any>(`/orders/${orderId}/status`, { status });
      this.successMessage = `Order ${res.orderNumber} status changed to ${status}!`;
      this.closeModals();
      this.loadOrders();
      this.loadInventory();
    } catch (err: any) {
      this.errorMessage = err.message || `Failed to update status to ${status}.`;
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // REPORTS
  // ==========================================
  async loadReports(): Promise<void> {
    this.loading = true;
    try {
      this.reportSummary = await this.api.get<any>('/reports/summary');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load report summary.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async loadAuditLogs(): Promise<void> {
    this.loading = true;
    try {
      this.auditLogs = await this.api.get<any[]>('/audit-logs');
      this.filteredAuditLogs = [...this.auditLogs];
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load audit logs.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  filterAuditLogs(): void {
    const q = this.auditSearchText.trim().toLowerCase();
    if (!q) {
      this.filteredAuditLogs = [...this.auditLogs];
      return;
    }
    this.filteredAuditLogs = this.auditLogs.filter(log =>
      (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.entityName && log.entityName.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  }
}
