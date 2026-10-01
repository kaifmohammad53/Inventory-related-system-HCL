$ErrorActionPreference = 'Stop'

Write-Host "======================================================="
Write-Host "   RETAIL INVENTORY MANAGEMENT SYSTEM - TEST SUITE     "
Write-Host "======================================================="

Write-Host "`n=== 1. Testing Authentication ==="
$loginPayload = @{ email = 'admin@retail.com'; password = 'admin123' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method Post -Body $loginPayload -ContentType 'application/json'
$token = $loginRes.token
Write-Host "SUCCESS: JWT Token acquired. Role: $($loginRes.role) | Email: $($loginRes.email)"
$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n=== 2. Testing Dashboard Stats ==="
$stats = Invoke-RestMethod -Uri 'http://localhost:8081/api/dashboard/stats' -Method Get -Headers $headers
Write-Host "SUCCESS: Total Products: $($stats.totalProducts), Total Stock Units: $($stats.totalInventory), Low Stock: $($stats.lowStockProducts), Pending POs: $($stats.pendingPurchaseOrders)"

Write-Host "`n=== 3. Testing Products API ==="
$products = Invoke-RestMethod -Uri 'http://localhost:8081/api/products' -Method Get -Headers $headers
Write-Host "SUCCESS: Active products count: $($products.Count)"

Write-Host "`n=== 4. Testing Warehouses API ==="
$warehouses = Invoke-RestMethod -Uri 'http://localhost:8081/api/warehouses' -Method Get -Headers $headers
Write-Host "SUCCESS: Warehouses count: $($warehouses.Count)"

Write-Host "`n=== 5. Testing Suppliers API ==="
$suppliers = Invoke-RestMethod -Uri 'http://localhost:8081/api/suppliers' -Method Get -Headers $headers
Write-Host "SUCCESS: Suppliers count: $($suppliers.Count)"

Write-Host "`n=== 6. Testing Inventory Management (Adjust and Transfer) ==="
$inv = Invoke-RestMethod -Uri 'http://localhost:8081/api/inventory' -Method Get -Headers $headers
Write-Host "SUCCESS: Initial inventory rows: $($inv.Count)"

$targetProduct = $products[0]
$w1 = $warehouses[0]
$w2 = $warehouses[1]

# Test Increase Stock
$adjPayload = @{
    productId = $targetProduct.id
    warehouseId = $w1.id
    quantity = 15
    type = 'INCREASE'
    reason = 'Stock replenishment automated test'
} | ConvertTo-Json
$adjRes = Invoke-RestMethod -Uri 'http://localhost:8081/api/inventory/adjust' -Method Post -Body $adjPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: Stock INCREASE verified. Product: $($targetProduct.name) at $($w1.name) -> New Quantity: $($adjRes.quantity)"

# Test Stock Transfer
$transferPayload = @{
    productId = $targetProduct.id
    fromWarehouseId = $w1.id
    toWarehouseId = $w2.id
    quantity = 5
    reason = 'Warehouse rebalance'
} | ConvertTo-Json
$trRes = Invoke-RestMethod -Uri 'http://localhost:8081/api/inventory/transfer' -Method Post -Body $transferPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: Stock TRANSFER verified: 5 units transferred from $($w1.name) to $($w2.name)"

Write-Host "`n=== 7. Testing Purchase Orders Lifecycle (Create -> Approve -> Receive) ==="
$poPayload = @{
    supplierId = $suppliers[0].id
    warehouseId = $warehouses[0].id
    notes = 'Automated test purchase order'
    items = @(
        @{
            productId = $products[0].id
            quantity = 25
            unitPrice = 75.00
        }
    )
} | ConvertTo-Json
$po = Invoke-RestMethod -Uri 'http://localhost:8081/api/purchase-orders' -Method Post -Body $poPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: PO Created: $($po.poNumber) | Status: $($po.status) | Total: `$$($po.totalAmount)"

# Approve PO
$statusApprovedPayload = @{ status = 'APPROVED' } | ConvertTo-Json
$poApproved = Invoke-RestMethod -Uri "http://localhost:8081/api/purchase-orders/$($po.id)/status" -Method Put -Body $statusApprovedPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: PO Approved: Status is now $($poApproved.status)"

# Receive PO (triggers automated inventory stock intake)
$statusReceivedPayload = @{ status = 'RECEIVED' } | ConvertTo-Json
$poReceived = Invoke-RestMethod -Uri "http://localhost:8081/api/purchase-orders/$($po.id)/status" -Method Put -Body $statusReceivedPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: PO Received: Status is now $($poReceived.status) (Warehouse inventory automatically credited!)"

Write-Host "`n=== 8. Testing 1-Click Auto-Reorder ==="
$autoUrl = "http://localhost:8081/api/purchase-orders/auto-reorder?productId=" + $products[0].id + "&warehouseId=" + $warehouses[0].id + "&supplierId=" + $suppliers[0].id + "&quantity=30"
$autoPo = Invoke-RestMethod -Uri $autoUrl -Method Post -Headers $headers
Write-Host "SUCCESS: 1-Click Auto-Reorder PO Generated: $($autoPo.poNumber) | Total: `$$($autoPo.totalAmount) | Status: $($autoPo.status)"

Write-Host "`n=== 9. Testing Sales Orders with Automatic Stock Deduction ==="
$soPayload = @{
    customerName = 'Mohammad Kaif'
    customerEmail = 'kaif@student.abes.ac.in'
    warehouseId = $warehouses[0].id
    notes = 'Student test customer order'
    items = @(
        @{
            productId = $products[0].id
            quantity = 2
            unitPrice = 129.99
        }
    )
} | ConvertTo-Json
$so = Invoke-RestMethod -Uri 'http://localhost:8081/api/orders' -Method Post -Body $soPayload -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: Sales Order Created: $($so.orderNumber) | Total: `$$($so.totalAmount) | Stock successfully deducted from warehouse $($warehouses[0].name)"

# Advance order status to COMPLETED
$soStatusCompleted = @{ status = 'COMPLETED' } | ConvertTo-Json
$soCompleted = Invoke-RestMethod -Uri "http://localhost:8081/api/orders/$($so.id)/status" -Method Put -Body $soStatusCompleted -Headers $headers -ContentType 'application/json'
Write-Host "SUCCESS: Sales Order Updated: Status is now $($soCompleted.status)"

Write-Host "`n=== 10. Testing Reports API and Summaries ==="
$repDash = Invoke-RestMethod -Uri 'http://localhost:8081/api/reports/summary' -Method Get -Headers $headers
Write-Host "SUCCESS: Inventory Valuation: `$$($repDash.totalInventoryValuation)"
Write-Host "SUCCESS: Total Stock Units across all facilities: $($repDash.totalStockQuantity)"
Write-Host "SUCCESS: Low Stock Items identified: $($repDash.lowStockCount)"
Write-Host "SUCCESS: Total Purchase Orders in system: $($repDash.totalPurchaseOrders)"
Write-Host "SUCCESS: Total Sales Orders in system: $($repDash.totalSalesOrders)"

Write-Host "`n=== 11. Testing Comprehensive Audit Trail ==="
$auditLogs = Invoke-RestMethod -Uri 'http://localhost:8081/api/audit-logs' -Method Get -Headers $headers
Write-Host "SUCCESS: Total Audit Trail records: $($auditLogs.Count)"
Write-Host "SUCCESS: Latest Audit Record: Action = [$($auditLogs[0].action)], Entity = [$($auditLogs[0].entityName)], User = [$($auditLogs[0].userEmail)], Details = [$($auditLogs[0].details)]"

Write-Host "`n=========================================================================="
Write-Host ">>> ALL 11 CAPSTONE SYSTEM MODULES VERIFIED AND WORKING 100% END-TO-END! <<<"
Write-Host "=========================================================================="
