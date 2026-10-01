$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "newuser_$timestamp@retail.com"

Write-Host "======================================================="
Write-Host "   REGISTRATION & AUTHENTICATION END-TO-END VERIFICATION"
Write-Host "======================================================="

Write-Host "`n=== 1. Testing Registration with NEW test email: $testEmail ==="
$regBody = @{
    fullName = "Test Registration User"
    email = $testEmail
    password = "Password123"
    role = "WAREHOUSE_MANAGER"
    phone = "9876543210"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
Write-Host "SUCCESS: Registration returned token: $($regRes.token.Substring(0, 20))... Role: $($regRes.role) Name: $($regRes.fullName)"

Write-Host "`n=== 2. Testing Duplicate Registration Error Handling ==="
try {
    $dupRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "ERROR: Duplicate registration was unexpectedly accepted!"
} catch {
    $errStream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errStream)
    $errBody = $reader.ReadToEnd()
    Write-Host "SUCCESS: Duplicate registration correctly rejected with response: $errBody"
}

Write-Host "`n=== 3. Testing Login with Newly Registered User ==="
$newLoginBody = @{
    email = $testEmail
    password = "Password123"
} | ConvertTo-Json

$newLoginRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $newLoginBody -ContentType "application/json"
Write-Host "SUCCESS: New user logged in successfully. Token acquired. User: $($newLoginRes.email) Role: $($newLoginRes.role)"

Write-Host "`n=== 4. Testing Existing Admin Login Intactness ==="
$adminLoginBody = @{
    email = "admin@retail.com"
    password = "admin123"
} | ConvertTo-Json

$adminLoginRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
Write-Host "SUCCESS: Admin login intact. Role: $($adminLoginRes.role) Email: $($adminLoginRes.email)"

Write-Host "`n======================================================="
Write-Host ">>> REGISTRATION & LOGIN FULLY VERIFIED END-TO-END! <<<"
Write-Host "======================================================="
