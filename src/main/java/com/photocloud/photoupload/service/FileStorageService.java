package com.photocloud.photoupload.service;

import com.photocloud.photoupload.config.FileStorageProperties;
import com.photocloud.photoupload.exception.FileNotFoundException;
import com.photocloud.photoupload.exception.FileStorageException;
import com.photocloud.photoupload.exception.InvalidFileException;
import com.photocloud.photoupload.exception.UnauthorizedAccessException;
import com.photocloud.photoupload.model.FileInfo;
import com.photocloud.photoupload.util.FileValidator;
import com.photocloud.photoupload.util.ImageCompressor;
import com.photocloud.photoupload.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProperties properties;
    private final FileValidator fileValidator;
    private final ImageCompressor imageCompressor;
    private final TokenGenerator tokenGenerator;

    private Path fileStorageLocation;
    private final Map<String, FileInfo> fileMetadataStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(properties.getPath()).toAbsolutePath().normalize();
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public FileInfo uploadFile(MultipartFile file) {
        fileValidator.validateFile(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileId = tokenGenerator.generateFileId();
        String savedFilename = tokenGenerator.generateUniqueFilename(originalFilename);
        String extension = FilenameUtils.getExtension(originalFilename);

        try {
            Path targetLocation = this.fileStorageLocation.resolve(savedFilename);
            
            File tempFile = File.createTempFile("upload_", "." + extension);
            file.transferTo(tempFile);

            boolean compressed = false;
            if (fileValidator.isCompressionNeeded(file.getSize(), properties.getCompressThreshold())) {
                try {
                    File compressedFile = File.createTempFile("compressed_", "." + extension);
                    imageCompressor.compressImage(tempFile, compressedFile);
                    tempFile.delete();
                    tempFile = compressedFile;
                    compressed = true;
                } catch (Exception e) {
                    log.warn("Image compression failed, using original file: {}", e.getMessage());
                }
            }

            Files.copy(tempFile.toPath(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            tempFile.delete();

            FileInfo fileInfo = FileInfo.builder()
                    .fileId(fileId)
                    .originalFilename(originalFilename)
                    .savedFilename(savedFilename)
                    .contentType(file.getContentType())
                    .size(Files.size(targetLocation))
                    .extension(extension)
                    .filePath(targetLocation.toString())
                    .uploadTime(LocalDateTime.now())
                    .build();

            if (properties.getAccessTokenEnabled()) {
                String accessToken = tokenGenerator.generateAccessToken(fileId);
                fileInfo.setAccessToken(accessToken);
                fileInfo.setTokenExpireTime(LocalDateTime.now().plusSeconds(properties.getAccessTokenExpire()));
            }

            fileMetadataStore.put(fileId, fileInfo);
            
            log.info("File uploaded successfully: fileId={}, original={}, saved={}, compressed={}", 
                    fileId, originalFilename, savedFilename, compressed);

            return fileInfo;
        } catch (IOException ex) {
            log.error("Failed to store file: {}", originalFilename, ex);
            throw new FileStorageException("Could not store file " + originalFilename, ex);
        }
    }

    public List<FileInfo> uploadMultipleFiles(MultipartFile[] files) {
        List<FileInfo> uploadedFiles = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                FileInfo fileInfo = uploadFile(file);
                uploadedFiles.add(fileInfo);
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            }
        }
        
        return uploadedFiles;
    }

    @Cacheable(value = "fileMetadata", key = "#fileId")
    public FileInfo getFileInfo(String fileId) {
        FileInfo fileInfo = fileMetadataStore.get(fileId);
        if (fileInfo == null) {
            throw new FileNotFoundException("File not found: " + fileId);
        }
        return fileInfo;
    }

    public Resource loadFileAsResource(String fileId, String token) {
        try {
            FileInfo fileInfo = getFileInfo(fileId);
            
            if (properties.getAccessTokenEnabled()) {
                validateAccessToken(fileInfo, token);
            }

            Path filePath = Paths.get(fileInfo.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found or not readable: " + fileId);
            }
        } catch (Exception ex) {
            throw new FileNotFoundException("File not found: " + fileId, ex);
        }
    }

    public Resource loadFileAsResourceWithRange(String fileId, String token, long start, long end) {
        return loadFileAsResource(fileId, token);
    }

    @CacheEvict(value = "fileMetadata", key = "#fileId")
    public void deleteFile(String fileId) {
        try {
            FileInfo fileInfo = getFileInfo(fileId);
            Path filePath = Paths.get(fileInfo.getFilePath());
            
            Files.deleteIfExists(filePath);
            fileMetadataStore.remove(fileId);
            
            log.info("File deleted successfully: fileId={}, filename={}", fileId, fileInfo.getSavedFilename());
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", fileId, ex);
            throw new FileStorageException("Could not delete file: " + fileId, ex);
        }
    }

    public List<FileInfo> listAllFiles() {
        return new ArrayList<>(fileMetadataStore.values());
    }

    public long getStorageUsage() {
        try {
            return Files.walk(fileStorageLocation)
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            return 0L;
                        }
                    })
                    .sum();
        } catch (IOException e) {
            log.error("Error calculating storage usage", e);
            return 0L;
        }
    }

    public void cleanupExpiredFiles(int daysOld) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysOld);
        
        List<String> expiredFileIds = new ArrayList<>();
        for (Map.Entry<String, FileInfo> entry : fileMetadataStore.entrySet()) {
            if (entry.getValue().getUploadTime().isBefore(threshold)) {
                expiredFileIds.add(entry.getKey());
            }
        }

        for (String fileId : expiredFileIds) {
            try {
                deleteFile(fileId);
                log.info("Cleaned up expired file: {}", fileId);
            } catch (Exception e) {
                log.error("Error cleaning up file: {}", fileId, e);
            }
        }
        
        log.info("Cleanup completed. Removed {} expired files", expiredFileIds.size());
    }

    private void validateAccessToken(FileInfo fileInfo, String token) {
        if (!properties.getAccessTokenEnabled()) {
            return;
        }

        if (token == null || token.trim().isEmpty()) {
            throw new UnauthorizedAccessException("Access token is required");
        }

        if (!token.equals(fileInfo.getAccessToken())) {
            throw new UnauthorizedAccessException("Invalid access token");
        }

        if (fileInfo.getTokenExpireTime() != null && 
            LocalDateTime.now().isAfter(fileInfo.getTokenExpireTime())) {
            throw new UnauthorizedAccessException("Access token has expired");
        }
    }

    public String refreshAccessToken(String fileId) {
        FileInfo fileInfo = getFileInfo(fileId);
        
        String newToken = tokenGenerator.generateAccessToken(fileId);
        fileInfo.setAccessToken(newToken);
        fileInfo.setTokenExpireTime(LocalDateTime.now().plusSeconds(properties.getAccessTokenExpire()));
        
        fileMetadataStore.put(fileId, fileInfo);
        
        log.info("Access token refreshed for file: {}", fileId);
        return newToken;
    }
}
