package com.voicepay.backend.controller;

import com.voicepay.backend.model.User;
import com.voicepay.backend.repository.UserRepository;
import com.voicepay.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.voicepay.backend.model.BankDetails;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user != null) {
            user.setPassword(null); // hide password
            user.setVoiceData(null); // no need to send voice bytes
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bank-details")
    public ResponseEntity<?> addBankDetails(@RequestBody BankDetails request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user != null) {
            user.setBankDetails(request);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Bank details added successfully!", "user", user));
        }
        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
    }
}
