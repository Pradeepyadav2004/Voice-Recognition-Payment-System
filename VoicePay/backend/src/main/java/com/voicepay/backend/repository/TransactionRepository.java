package com.voicepay.backend.repository;

import com.voicepay.backend.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findBySenderIdOrReceiverIdOrderByTimestampDesc(String senderId, String receiverId);
}
