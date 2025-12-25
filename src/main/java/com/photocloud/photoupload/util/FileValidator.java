package com.photocloud.photoupload.util;

import com.photocloud.photoupload.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class FileValidator {

    @Value("${file.upload.allowed-extensions}")
    private String allowedExtensionsStr;

    @Value("${file.upload.max-size}")
    private Long maxFileSize;

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty or null");
        }

        validateFileSize(file);
        validateFileExtension(file);
        validateFileName(file);
        validateContentType(file);
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > maxFileSize) {
            throw new InvalidFileException(
                String.format("File size %d exceeds maximum allowed size %d", 
                    file.getSize(), maxFileSize)
            );
        }
    }

    private void validateFileExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new InvalidFileException("Filename is null");
        }

        String extension = FilenameUtils.getExtension(filename).toLowerCase();
        List<String> allowedExtensions = Arrays.asList(allowedExtensionsStr.split(","));

        if (!allowedExtensions.contains(extension)) {
            throw new InvalidFileException(
                String.format("File extension .%s is not allowed. Allowed: %s", 
                    extension, String.join(", ", allowedExtensions))
            );
        }
    }

    private void validateFileName(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new InvalidFileException("Filename is empty");
        }

        if (filename.contains("..")) {
            throw new InvalidFileException("Filename contains invalid path sequence '..'");
        }

        if (!filename.matches("^[a-zA-Z0-9._\\-\\u4e00-\\u9fa5]+$")) {
            throw new InvalidFileException("Filename contains invalid characters");
        }
    }

    private void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException("File content type is not an image");
        }
    }

    public boolean isCompressionNeeded(long fileSize, long threshold) {
        return fileSize > threshold;
    }

    public String sanitizeFilename(String filename) {
        if (filename == null) {
            return null;
        }
        
        return filename.replaceAll("[^a-zA-Z0-9._\\-\\u4e00-\\u9fa5]", "_");
    }
}
