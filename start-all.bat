@echo off
echo ===================================================
echo   Retail Inventory Management System - Quick Start
echo ===================================================

echo [1/3] Starting MySQL Server on port 3307...
start "MySQL Server (Port 3307)" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="C:\Users\Public\mysql_data" --port=3307 --console

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend on port 8081...
start "Spring Boot Backend" cmd /c "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Angular Frontend on port 4200...
start "Angular Frontend" cmd /c "cd /d %~dp0frontend && ng.cmd serve --port 4200"

timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:4200 ...
start http://localhost:4200

echo ===================================================
echo Retail Inventory System is launching!
echo Credentials:
echo   ADMIN:             admin@retail.com / admin123
echo   WAREHOUSE MANAGER: warehouse@retail.com / warehouse123
echo   STORE MANAGER:     store@retail.com / store123
echo   SUPPLIER:          supplier@retail.com / supplier123
echo ===================================================
pause
