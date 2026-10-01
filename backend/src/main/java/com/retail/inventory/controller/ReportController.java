package com.retail.inventory.controller;

import com.retail.inventory.dto.ReportSummaryDTO;
import com.retail.inventory.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER')")
    public ResponseEntity<ReportSummaryDTO> getReportSummary() {
        return ResponseEntity.ok(reportService.getReportSummary());
    }
}
