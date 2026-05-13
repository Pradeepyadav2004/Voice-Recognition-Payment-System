package com.voicepay.backend.controller;

import com.voicepay.backend.model.Role;
import com.voicepay.backend.model.User;
import com.voicepay.backend.repository.UserRepository;
import com.voicepay.backend.security.JwtUtils;
import com.voicepay.backend.service.AudioVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import com.voicepay.backend.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AudioVerificationService audioVerificationService;

    @Autowired
    EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam("name") String name,
                                          @RequestParam("email") String email,
                                          @RequestParam("password") String password,
                                          @RequestParam("voiceData") MultipartFile voiceData) {
        try {
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
            }

            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(encoder.encode(password));
            user.setRole(Role.USER);
            user.setBalance(1000.0); // Initial bonus balance for demo
            
            if (voiceData != null && !voiceData.isEmpty()) {
                user.setVoiceData(voiceData.getBytes());
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Voice data is required!"));
            }

            userRepository.save(user);

            // Send registration welcome email
            emailService.sendRegistrationEmail(email, name);

            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login-step1")
    public ResponseEntity<?> authenticateUserStep1(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && encoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.ok(Map.of("userId", userOpt.get().getId(), "message", "Step 1 success. Proceed to voice verification."));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Error: Invalid credentials"));
        }
    }

    @PostMapping("/verify-voice")
    public ResponseEntity<?> verifyVoice(@RequestParam("userId") String userId,
                                         @RequestParam("voiceData") MultipartFile voiceData) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: User not found"));
            }

            User user = userOpt.get();
            byte[] newVoiceBytes = voiceData.getBytes();

            boolean isVoiceMatch = audioVerificationService.verifyVoice(user.getVoiceData(), newVoiceBytes);

            if (isVoiceMatch) {
                // Generate JWT using a dummy Auth format or fetch real user details
                org.springframework.security.core.userdetails.UserDetails userDetails = 
                     com.voicepay.backend.security.UserDetailsImpl.build(user);

                org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication = 
                     new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                     
                String jwt = jwtUtils.generateJwtToken(authentication);
                return ResponseEntity.ok(Map.of("token", jwt, "message", "Voice verified successfully"));
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Error: Voice verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}
