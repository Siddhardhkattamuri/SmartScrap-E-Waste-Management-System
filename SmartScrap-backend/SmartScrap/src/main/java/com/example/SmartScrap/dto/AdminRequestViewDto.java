package com.example.SmartScrap.dto;

import com.example.SmartScrap.model.EwasteRequest;
import com.example.SmartScrap.model.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminRequestViewDto {
    private Long id;
    // --- NEW: Added fields to match the model ---
    private String deviceType;
    private String brand;
    private String model;
    private String itemCondition; // Corrected from itemDescription
    
    private int quantity;
    private String pickupAddress;
    
    private LocalDateTime createdAt; // Corrected from requestDate
    
    private Status status;
    private String userEmail;
    private String userFullName;
    private String remarks;
    private String imagePaths;

    // A handy constructor to convert from the Entity to the DTO
    public AdminRequestViewDto(EwasteRequest request) {
        this.id = request.getId();
        
        // --- ALL FIELDS ARE NOW CORRECTLY MAPPED ---
        this.deviceType = request.getDeviceType();
        this.brand = request.getBrand();
        this.model = request.getModel();
        this.itemCondition = request.getItemCondition(); // Use the correct field name
        this.quantity = request.getQuantity();
        this.pickupAddress = request.getPickupAddress();
        this.createdAt = request.getCreatedAt(); // Use the correct field name
        this.remarks = request.getRemarks();
        this.imagePaths = request.getImagePaths();
        this.status = request.getStatus();
        
        if (request.getUser() != null) {
            this.userEmail = request.getUser().getEmail();
            this.userFullName = request.getUser().getFullName();
        }
    }
}