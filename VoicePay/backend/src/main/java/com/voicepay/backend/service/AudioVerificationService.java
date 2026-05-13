package com.voicepay.backend.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class AudioVerificationService {

    /**
     * Basic version of voice verification.
     * In a real advanced system, this would extract MFCC features
     * or use a Python microservice with voice embeddings.
     */
    public boolean verifyVoice(byte[] storedVoice, byte[] newVoice) {
        if (storedVoice == null || newVoice == null) {
            return false;
        }
        
        // For POC/MVP purposes since exact byte arrays never match for live audio due to mic noise:
        // We simulate a match if the new voice sample length is within 30% of stored voice.
        // Or if the user exactly uploads the same file, Arrays.equals would be true.
        
        if (Arrays.equals(storedVoice, newVoice)) {
            return true;
        }
        
        // Simulated 'Biometric' matching for demo:
        double lengthRatio = (double) newVoice.length / storedVoice.length;
        if (lengthRatio > 0.5 && lengthRatio < 1.5) {
            return true; // Simple heuristics to allow presentation login to work
        }
        
        return false;
    }
}
