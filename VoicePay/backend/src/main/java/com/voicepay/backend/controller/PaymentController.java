package com.voicepay.backend.controller;

import com.voicepay.backend.model.Transaction;
import com.voicepay.backend.model.User;
import com.voicepay.backend.repository.TransactionRepository;
import com.voicepay.backend.repository.UserRepository;
import com.voicepay.backend.security.UserDetailsImpl;
import com.voicepay.backend.service.AudioVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class PaymentController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AudioVerificationService audioVerificationService;

    @PostMapping("/pay")
    public ResponseEntity<?> makePayment(@RequestParam("receiverAccountNumber") String receiverAccountNumber,
                                         @RequestParam("receiverIfscCode") String receiverIfscCode,
                                         @RequestParam("amount") Double amount,
                                         @RequestParam(value = "description", required = false) String description,
                                         @RequestParam("voiceData") MultipartFile voiceData) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String senderId = userDetails.getId();

            User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
            
            boolean isVoiceMatch = audioVerificationService.verifyVoice(sender.getVoiceData(), voiceData.getBytes());
            if (!isVoiceMatch) {
                return ResponseEntity.status(401).body(Map.of("message", "Voice verification failed. Payment unauthorized."));
            }

            if (sender.getBalance() == null || sender.getBalance() < amount) {
                return ResponseEntity.badRequest().body(Map.of("message", "Insufficient balance."));
            }

            Optional<User> receiverOpt = userRepository.findByBankDetailsAccountNumber(receiverAccountNumber);
            if (!receiverOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No user found with this Account Number."));
            }
            User receiver = receiverOpt.get();

            // Additional security: verify IFSC code matches the system
            if (receiver.getBankDetails() == null || 
                receiver.getBankDetails().getIfscCode() == null || 
                !receiver.getBankDetails().getIfscCode().equals(receiverIfscCode)) {
                 return ResponseEntity.badRequest().body(Map.of("message", "Invalid IFSC Code for this Account Number."));
            }

            // Deduct and add balance
            sender.setBalance((sender.getBalance() != null ? sender.getBalance() : 0.0) - amount);
            receiver.setBalance((receiver.getBalance() != null ? receiver.getBalance() : 0.0) + amount);

            userRepository.save(sender);
            userRepository.save(receiver);

            // Record transaction
            Transaction tx = new Transaction();
            tx.setSenderId(sender.getId());
            tx.setSenderName(sender.getName());
            tx.setReceiverId(receiver.getId());
            tx.setReceiverName(receiver.getName());
            tx.setReceiverAccountNumber(receiverAccountNumber);
            tx.setReceiverIfscCode(receiverIfscCode);
            tx.setAmount(amount);
            tx.setDescription(description);
            tx.setStatus("SUCCESS");

            transactionRepository.save(tx);

            return ResponseEntity.ok(Map.of("message", "Payment successful!", "transactionId", tx.getId()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentTransactions() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = userDetails.getId();
        
        List<Transaction> txs = transactionRepository.findBySenderIdOrReceiverIdOrderByTimestampDesc(userId, userId);
        return ResponseEntity.ok(txs.stream().limit(5).toList());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = userDetails.getId();
        
        List<Transaction> txs = transactionRepository.findBySenderIdOrReceiverIdOrderByTimestampDesc(userId, userId);
        return ResponseEntity.ok(txs);
    }
}
