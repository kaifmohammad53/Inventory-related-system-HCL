package com.retail.inventory.service;

import com.retail.inventory.dto.SupplierRequest;
import com.retail.inventory.entity.Supplier;
import com.retail.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;

    public SupplierService(SupplierRepository supplierRepository, AuditLogService auditLogService) {
        this.supplierRepository = supplierRepository;
        this.auditLogService = auditLogService;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findByActiveTrue();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
    }

    @Transactional
    public Supplier createSupplier(SupplierRequest request, String userEmail) {
        Supplier supplier = new Supplier(
                request.getName(),
                request.getContactPerson(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );

        Supplier saved = supplierRepository.save(supplier);

        auditLogService.log(userEmail, "SUPPLIER_CREATED", "SUPPLIER", saved.getId().toString(),
                "Created supplier: " + saved.getName());

        return saved;
    }

    @Transactional
    public Supplier updateSupplier(Long id, SupplierRequest request, String userEmail) {
        Supplier supplier = getSupplierById(id);

        if (request.getName() != null) supplier.setName(request.getName());
        if (request.getContactPerson() != null) supplier.setContactPerson(request.getContactPerson());
        if (request.getEmail() != null) supplier.setEmail(request.getEmail());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone());
        if (request.getAddress() != null) supplier.setAddress(request.getAddress());

        Supplier updated = supplierRepository.save(supplier);

        auditLogService.log(userEmail, "SUPPLIER_UPDATED", "SUPPLIER", updated.getId().toString(),
                "Updated supplier: " + updated.getName());

        return updated;
    }

    @Transactional
    public void deleteSupplier(Long id, String userEmail) {
        Supplier supplier = getSupplierById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);

        auditLogService.log(userEmail, "SUPPLIER_DELETED", "SUPPLIER", id.toString(),
                "Deactivated supplier: " + supplier.getName());
    }
}
