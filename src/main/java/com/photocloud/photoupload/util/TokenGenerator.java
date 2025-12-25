package com.photocloud.photoupload.util;

import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

@Component
public class TokenGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

    public String generateFileId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public String generateAccessToken(String fileId) {
        try {
            byte[] randomBytes = new byte[24];
            secureRandom.nextBytes(randomBytes);
            String randomStr = base64Encoder.encodeToString(randomBytes);
            
            String input = fileId + randomStr + System.currentTimeMillis();
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            
            return base64Encoder.encodeToString(hash).substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    public String generateUniqueFilename(String originalFilename) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            String extension = originalFilename.substring(lastDotIndex);
            return timestamp + "_" + uuid + extension;
        }
        
        return timestamp + "_" + uuid;
    }
}
