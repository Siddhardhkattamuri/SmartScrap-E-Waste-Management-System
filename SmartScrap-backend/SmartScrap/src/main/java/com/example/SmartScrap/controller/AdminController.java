package com.example.SmartScrap.controller;

import com.example.SmartScrap.dto.AdminDashboardStatsDto;
import com.example.SmartScrap.dto.AdminRequestViewDto;
import com.example.SmartScrap.dto.AdminStatusUpdateRequest;
import com.example.SmartScrap.model.EwasteRequest;
import com.example.SmartScrap.model.Status;
import com.example.SmartScrap.model.User;
import com.example.SmartScrap.repository.EwasteRequestRepository;
import com.example.SmartScrap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EwasteRequestRepository ewasteRequestRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // This endpoint can expose passwords, which is a security risk.
        // For a real application, you would create a UserViewDto.
        // For now, this is acceptable for functionality.
        List<User> users = userRepository.findAll();
        users.forEach(user -> user.setPassword(null)); // Avoid sending password hashes
        return ResponseEntity.ok(users);
    }

    // --- MODIFIED: This now uses the safe AdminRequestViewDto ---
    @GetMapping("/requests")
    public ResponseEntity<List<AdminRequestViewDto>> getAllRequests() {
        List<EwasteRequest> allRequests = ewasteRequestRepository.findAll();
        List<AdminRequestViewDto> requestViews = allRequests.stream()
                .map(AdminRequestViewDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(requestViews);
    }

    // --- MODIFIED: This is the new, powerful update method ---
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<EwasteRequest> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody AdminStatusUpdateRequest statusUpdate) {

        EwasteRequest request = ewasteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));

        // Update the status
        request.setStatus(statusUpdate.getStatus());

        // Handle logic based on the new status
        if (statusUpdate.getStatus() == Status.REJECTED) {
            request.setRejectionReason(statusUpdate.getRejectionReason());
            request.setPickupDate(null); // Clear any previously scheduled date
        } else if (statusUpdate.getStatus() == Status.SCHEDULED) {
            if (statusUpdate.getPickupDate() != null && !statusUpdate.getPickupDate().isEmpty()) {
                DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
                LocalDateTime pickupDateTime = LocalDateTime.parse(statusUpdate.getPickupDate(), formatter);
                request.setPickupDate(pickupDateTime);
            }
            request.setRejectionReason(null); // Clear any previous rejection reason
        } else {
            // For any other status, clear these optional fields
            request.setPickupDate(null);
            request.setRejectionReason(null);
        }

        return ResponseEntity.ok(ewasteRequestRepository.save(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getStats() {
        long totalUsers = userRepository.count();
        long totalRequests = ewasteRequestRepository.count();
        long pendingRequests = ewasteRequestRepository.findAll().stream().filter(r -> r.getStatus() == Status.PENDING).count();
        long completedRequests = ewasteRequestRepository.findAll().stream().filter(r -> r.getStatus() == Status.COMPLETED).count();

        AdminDashboardStatsDto stats = new AdminDashboardStatsDto(totalUsers, totalRequests, pendingRequests, completedRequests);
        return ResponseEntity.ok(stats);
    }
}