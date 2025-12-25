package com.photocloud.photoupload.util;

import com.photocloud.photoupload.constants.ErrorCode;
import com.photocloud.photoupload.constants.FileConstants;
import com.photocloud.photoupload.exception.InvalidFileException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileValidator {

    private static final Pattern FILENAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._\\-\\u4e00-\\u9fa5]+$");
    private static final String PATH_TRAVERSAL = "..";
    
    private final FileValidatorConfig config;

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException(ErrorCode.FILE_EMPTY);
        }

        validateFileSize(file);
        validateFileExtension(file);
        validateFileName(file);
        validateContentType(file);
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > config.getMaxFileSize()) {
            String message = String.format("%s: %d > %d", 
                    ErrorCode.FILE_SIZE_EXCEEDED, file.getSize(), config.getMaxFileSize());
            throw new InvalidFileException(message);
        }
    }

    private void validateFileExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new InvalidFileException(ErrorCode.INVALID_FILENAME);
        }

        String extension = FilenameUtils.getExtension(filename).toLowerCase();
        List<String> allowedExtensions = config.getAllowedExtensions();

        if (!allowedExtensions.contains(extension)) {
            String message = String.format("%s: .%s. Allowed: %s", 
                    ErrorCode.INVALID_FILE_EXTENSION, extension, String.join(", ", allowedExtensions));
            throw new InvalidFileException(message);
        }
    }

    private void validateFileName(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new InvalidFileException(ErrorCode.INVALID_FILENAME);
        }

        if (filename.contains(PATH_TRAVERSAL)) {
            throw new InvalidFileException(ErrorCode.INVALID_FILENAME + ": contains path traversal");
        }

        if (!FILENAME_PATTERN.matcher(filename).matches()) {
            throw new InvalidFileException(ErrorCode.INVALID_FILENAME + ": contains invalid characters");
        }
    }

    private void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith(FileConstants.IMAGE_CONTENT_TYPE_PREFIX)) {
            throw new InvalidFileException(ErrorCode.INVALID_CONTENT_TYPE);
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

@Component
@RequiredArgsConstructor
class FileValidatorConfig {
    
    private final org.springframework.beans.factory.annotation.Value("${file.upload.allowed-extensions}") 
    String allowedExtensionsStr;
    
    private final org.springframework.beans.factory.annotation.Value("${file.upload.max-size}") 
    Long maxFileSize;
    
    public List<String> getAllowedExtensions() {
        return Arrays.asList(allowedExtensionsStr.split(","));
    }
    
    public Long getMaxFileSize() {
        return maxFileSize;
    }
}