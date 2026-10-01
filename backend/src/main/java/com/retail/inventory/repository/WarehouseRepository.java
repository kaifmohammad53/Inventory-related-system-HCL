package com.retail.inventory.repository;

import com.retail.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByActiveTrue();
    Optional<Warehouse> findByCode(String code);
    long countByActiveTrue();
}
