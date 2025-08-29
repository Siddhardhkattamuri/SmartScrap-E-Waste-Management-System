package com.example.SmartScrap.repository;

import com.example.SmartScrap.model.EwasteRequest;
import com.example.SmartScrap.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EwasteRequestRepository extends JpaRepository<EwasteRequest, Long> {
    
    // This method name must exactly match the 'createdAt' field above.
    List<EwasteRequest> findByUserOrderByCreatedAtDesc(User user);

}