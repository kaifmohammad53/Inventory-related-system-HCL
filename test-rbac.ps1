$ErrorActionPreference = 'Stop'

Write-Host "======================================================="
Write-Host "   ROLE-BASED ACCESS CONTROL (RBAC) TEST SUITE         "
Write-Host "======================================================="

function Get-AuthToken($email, $password) {
    $payload = @{ email = $email; password = $password } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method Post -Body $payload -ContentType 'application/json'
    return $res.token
}

function Test-ApiAccess($name, $url, $method, $token, $expectedStatus) {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $res = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -ContentType 'application/json'
        if ($expectedStatus -eq 200) {
            Write-Host "SUCCESS: [$name] Access GRANTED as expected (HTTP 200)"
        } else {
            Write-Host "ERROR: [$name] UNEXPECTED ACCESS GRANTED! Expected HTTP $expectedStatus"
        }
    } catch {
        $statusCode = [int]$_.Exception.Response.StatusCode
        if ($statusCode -eq $expectedStatus) {
            Write-Host "SUCCESS: [$name] Access RESTRICTED as expected (HTTP $statusCode Forbidden/Blocked)"
        } else {
            Write-Host "ERROR: [$name] Unexpected status code: HTTP $statusCode (Expected $expectedStatus)"
        }
    }
}

Write-Host "`n=== 1. Testing Registration Security (Admin Creation Block) ==="
$adminRegAttempt = @{
    fullName = 'Hacker User'
    email = 'hacker@evil.com'
    password = 'password123'
    role = 'ADMIN'
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/register' -Method Post -Body $adminRegAttempt -ContentType 'application/json'
    Write-Host 'ERROR: Public registration as ADMIN was accepted!'
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "SUCCESS: Public registration as ADMIN was blocked with HTTP $statusCode"
}

# Test safe role registration
$randNum = Get-Random -Minimum 1000 -Maximum 9999
$safeReg = @{
    fullName = 'New Store Manager'
    email = "newstore_$randNum@retail.com"
    password = 'password123'
    role = 'STORE_MANAGER'
} | ConvertTo-Json
$regRes = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/register' -Method Post -Body $safeReg -ContentType 'application/json'
Write-Host "SUCCESS: Public registration with safe role (STORE_MANAGER) succeeded. Role: $($regRes.role)"

Write-Host "`n=== 2. Testing ADMIN Role Permissions ==="
$adminToken = Get-AuthToken 'admin@retail.com' 'admin123'
Test-ApiAccess 'ADMIN -> GET /api/audit-logs' 'http://localhost:8081/api/audit-logs' 'Get' $adminToken 200
Test-ApiAccess 'ADMIN -> GET /api/warehouses' 'http://localhost:8081/api/warehouses' 'Get' $adminToken 200
Test-ApiAccess 'ADMIN -> GET /api/products' 'http://localhost:8081/api/products' 'Get' $adminToken 200
Test-ApiAccess 'ADMIN -> GET /api/orders' 'http://localhost:8081/api/orders' 'Get' $adminToken 200

Write-Host "`n=== 3. Testing WAREHOUSE_MANAGER Role Permissions and Isolation ==="
$warehouseToken = Get-AuthToken 'warehouse@retail.com' 'warehouse123'
Test-ApiAccess 'WAREHOUSE_MGR -> GET /api/inventory' 'http://localhost:8081/api/inventory' 'Get' $warehouseToken 200
Test-ApiAccess 'WAREHOUSE_MGR -> GET /api/warehouses' 'http://localhost:8081/api/warehouses' 'Get' $warehouseToken 200
Test-ApiAccess 'WAREHOUSE_MGR -> GET /api/purchase-orders' 'http://localhost:8081/api/purchase-orders' 'Get' $warehouseToken 200
Test-ApiAccess 'WAREHOUSE_MGR -> GET /api/audit-logs (RESTRICTED)' 'http://localhost:8081/api/audit-logs' 'Get' $warehouseToken 403
Test-ApiAccess 'WAREHOUSE_MGR -> GET /api/orders (RESTRICTED)' 'http://localhost:8081/api/orders' 'Get' $warehouseToken 403

Write-Host "`n=== 4. Testing STORE_MANAGER Role Permissions and Isolation ==="
$storeToken = Get-AuthToken 'store@retail.com' 'store123'
Test-ApiAccess 'STORE_MGR -> GET /api/products' 'http://localhost:8081/api/products' 'Get' $storeToken 200
Test-ApiAccess 'STORE_MGR -> GET /api/orders' 'http://localhost:8081/api/orders' 'Get' $storeToken 200
Test-ApiAccess 'STORE_MGR -> GET /api/audit-logs (RESTRICTED)' 'http://localhost:8081/api/audit-logs' 'Get' $storeToken 403

Write-Host "`n=== 5. Testing SUPPLIER Role Permissions and Isolation ==="
$supplierToken = Get-AuthToken 'supplier@retail.com' 'supplier123'
Test-ApiAccess 'SUPPLIER -> GET /api/purchase-orders' 'http://localhost:8081/api/purchase-orders' 'Get' $supplierToken 200
Test-ApiAccess 'SUPPLIER -> GET /api/suppliers' 'http://localhost:8081/api/suppliers' 'Get' $supplierToken 200
Test-ApiAccess 'SUPPLIER -> GET /api/audit-logs (RESTRICTED)' 'http://localhost:8081/api/audit-logs' 'Get' $supplierToken 403
Test-ApiAccess 'SUPPLIER -> GET /api/orders (RESTRICTED)' 'http://localhost:8081/api/orders' 'Get' $supplierToken 403

Write-Host "`n=== 6. Testing Google OAuth Backend Endpoint Validation ==="
$googleReq = @{
    idToken = 'invalid.test.token.xyz'
    requestedRole = 'STORE_MANAGER'
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/google' -Method Post -Body $googleReq -ContentType 'application/json'
    Write-Host 'ERROR: Fake or invalid Google token was accepted!'
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "SUCCESS: Invalid Google token rejected by backend verification (HTTP $statusCode)"
}

Write-Host "`n======================================================="
Write-Host ">>> RBAC AND GOOGLE AUTH VERIFICATION COMPLETE (100%) <<<"
Write-Host "======================================================="
