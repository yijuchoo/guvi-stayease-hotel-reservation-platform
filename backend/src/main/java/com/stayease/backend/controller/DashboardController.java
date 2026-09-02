package com.stayease.backend.controller;

import com.stayease.backend.dto.AdminDashboardResponse;
import com.stayease.backend.dto.CustomerDashboardResponse;
import com.stayease.backend.dto.ManagerDashboardResponse;
import com.stayease.backend.security.CurrentUserService;
import com.stayease.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @Autowired
    public DashboardController(DashboardService dashboardService, CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.currentUserService = currentUserService;
    }

    @Operation(summary = "View the currently authenticated customer's booking and spending summary")
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerDashboardResponse> getCustomerDashboard(Authentication authentication) {
        String customerId = currentUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(customerId));
    }

    @Operation(summary = "View the currently authenticated Hotel Manager's properties and revenue summary")
    @GetMapping("/manager")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<ManagerDashboardResponse> getManagerDashboard(Authentication authentication) {
        String ownerId = currentUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok(dashboardService.getManagerDashboard(ownerId));
    }

    @Operation(summary = "View platform-wide statistics (Admin only)")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
