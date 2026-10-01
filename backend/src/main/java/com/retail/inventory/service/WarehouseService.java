package com.retail.inventory.service;

import com.retail.inventory.dto.WarehouseRequest;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final AuditLogService auditLogService;

    public WarehouseService(WarehouseRepository warehouseRepository, AuditLogService auditLogService) {
        this.warehouseRepository = warehouseRepository;
        this.auditLogService = auditLogService;
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findByActiveTrue();
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
    }

    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request, String userEmail) {
        if (warehouseRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Warehouse code '" + request.getCode() + "' already exists");
        }

        Warehouse warehouse = new Warehouse(
                request.getCode(),
                request.getName(),
                request.getLocation(),
                request.getAddress(),
                request.getCapacity() != null ? request.getCapacity() : 10000,
                request.getManager()
        );

        Warehouse saved = warehouseRepository.save(warehouse);

        auditLogService.log(userEmail, "WAREHOUSE_CREATED", "WAREHOUSE", saved.getId().toString(),
                "Created warehouse: " + saved.getName() + " (" + saved.getCode() + ")");

        return saved;
    }

    @Transactional
    public Warehouse updateWarehouse(Long id, WarehouseRequest request, String userEmail) {
        Warehouse warehouse = getWarehouseById(id);

        if (request.getCode() != null && !request.getCode().equals(warehouse.getCode())) {
            if (warehouseRepository.findByCode(request.getCode()).isPresent()) {
                throw new IllegalArgumentException("Warehouse code '" + request.getCode() + "' already exists");
            }
            warehouse.setCode(request.getCode());
        }

        if (request.getName() != null) warehouse.setName(request.getName());
        if (request.getLocation() != null) warehouse.setLocation(request.getLocation());
        if (request.getAddress() != null) warehouse.setAddress(request.getAddress());
        if (request.getCapacity() != null) warehouse.setCapacity(request.getCapacity());
        if (request.getManager() != null) warehouse.setManager(request.getManager());

        Warehouse updated = warehouseRepository.save(warehouse);

        auditLogService.log(userEmail, "WAREHOUSE_UPDATED", "WAREHOUSE", updated.getId().toString(),
                "Updated warehouse: " + updated.getName() + " (" + updated.getCode() + ")");

        return updated;
    }

    @Transactional
    public void deleteWarehouse(Long id, String userEmail) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);

        auditLogService.log(userEmail, "WAREHOUSE_DELETED", "WAREHOUSE", id.toString(),
                "Deactivated warehouse: " + warehouse.getName() + " (" + warehouse.getCode() + ")");
    }
}
