package com.photocloud.photoupload.service;

import com.photocloud.photoupload.config.FileStorageProperties;
import com.photocloud.photoupload.constants.ErrorCode;
import com.photocloud.photoupload.constants.FileConstants;
import com.photocloud.photoupload.exception.FileNotFoundException;
import com.photocloud.photoupload.exception.FileStorageException;
import com.photocloud.photoupload.exception.UnauthorizedAccessException;
import com.photocloud.photoupload.model.FileInfo;
import com.photocloud.photoupload.repository.FileMetadataRepository;
import com.photocloud.photoupload.util.FileValidator;
import com.photocloud.photoupload.util.ImageCompressor;
import com.photocloud.photoupload.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService implements IFileStorageService {

    private final FileStorageProperties properties;
    private final FileValidator fileValidator;
    private final ImageCompressor imageCompressor;
    private final TokenGenerator tokenGenerator;
    private final FileMetadataRepository metadataRepository;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(properties.getPath())
                    .toAbsolutePath()
                    .normalize();
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    @Override
    public FileInfo uploadFile(MultipartFile file) {
        fileValidator.validateFile(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileId = tokenGenerator.generateFileId();
        String savedFilename = tokenGenerator.generateUniqueFilename(originalFilename);
        String extension = FilenameUtils.getExtension(originalFilename);

        try {
            Path targetLocation = this.fileStorageLocation.resolve(savedFilename);
            File processedFile = processFile(file, extension);

            Files.copy(processedFile.toPath(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            boolean deleted = processedFile.delete();
            if (!deleted) {
                log.warn("Failed to delete temporary file: {}", processedFile.getAbsolutePath());
            }

            FileInfo fileInfo = buildFileInfo(fileId, originalFilename, savedFilename, 
                    file.getContentType(), extension, targetLocation);

            metadataRepository.save(fileInfo);
            
            log.info("File uploaded successfully: fileId={}, original={}, saved={}", 
                    fileId, originalFilename, savedFilename);

            return fileInfo;
        } catch (IOException ex) {
            log.error("Failed to store file: {}", originalFilename, ex);
            throw new FileStorageException("Could not store file " + originalFilename, ex);
        }
    }

    private File processFile(MultipartFile file, String extension) throws IOException {
        File tempFile = File.createTempFile(FileConstants.TEMP_FILE_PREFIX, "." + extension);
        file.transferTo(tempFile);

        if (fileValidator.isCompressionNeeded(file.getSize(), properties.getCompressThreshold())) {
            try {
                File compressedFile = File.createTempFile(FileConstants.COMPRESSED_FILE_PREFIX, "." + extension);
                imageCompressor.compressImage(tempFile, compressedFile);
                boolean deleted = tempFile.delete();
                if (!deleted) {
                    log.warn("Failed to delete original temp file: {}", tempFile.getAbsolutePath());
                }
                return compressedFile;
            } catch (Exception e) {
                log.warn("Image compression failed, using original file: {}", e.getMessage());
            }
        }
        return tempFile;
    }

    private FileInfo buildFileInfo(String fileId, String originalFilename, String savedFilename,
                                    String contentType, String extension, Path targetLocation) throws IOException {
        FileInfo.FileInfoBuilder builder = FileInfo.builder()
                .fileId(fileId)
                .originalFilename(originalFilename)
                .savedFilename(savedFilename)
                .contentType(contentType)
                .size(Files.size(targetLocation))
                .extension(extension)
                .filePath(targetLocation.toString())
                .uploadTime(LocalDateTime.now());

        if (Boolean.TRUE.equals(properties.getAccessTokenEnabled())) {
            String accessToken = tokenGenerator.generateAccessToken(fileId);
            builder.accessToken(accessToken)
                   .tokenExpireTime(LocalDateTime.now().plusSeconds(properties.getAccessTokenExpire()));
        }

        return builder.build();
    }

    @Override
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

    @Override
    @Cacheable(value = FileConstants.CACHE_FILE_METADATA, key = "#fileId")
    public FileInfo getFileInfo(String fileId) {
        return metadataRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException(ErrorCode.FILE_NOT_FOUND + ": " + fileId));
    }

    @Override
    public Resource loadFileAsResource(String fileId, String token) {
        try {
            FileInfo fileInfo = getFileInfo(fileId);
            
            if (Boolean.TRUE.equals(properties.getAccessTokenEnabled())) {
                validateAccessToken(fileInfo, token);
            }

            Path filePath = Paths.get(fileInfo.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException(ErrorCode.FILE_NOT_FOUND + ": " + fileId);
            }
        } catch (FileNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new FileNotFoundException(ErrorCode.FILE_NOT_FOUND + ": " + fileId, ex);
        }
    }

    @Override
    @CacheEvict(value = FileConstants.CACHE_FILE_METADATA, key = "#fileId")
    public void deleteFile(String fileId) {
        try {
            FileInfo fileInfo = getFileInfo(fileId);
            Path filePath = Paths.get(fileInfo.getFilePath());
            
            Files.deleteIfExists(filePath);
            metadataRepository.deleteById(fileId);
            
            log.info("File deleted successfully: fileId={}, filename={}", fileId, fileInfo.getSavedFilename());
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", fileId, ex);
            throw new FileStorageException("Could not delete file: " + fileId, ex);
        }
    }

    @Override
    public List<FileInfo> listAllFiles() {
        return metadataRepository.findAll();
    }

    @Override
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

    @Override
    public void cleanupExpiredFiles(int daysOld) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysOld);
        
        List<FileInfo> allFiles = metadataRepository.findAll();
        List<String> expiredFileIds = allFiles.stream()
                .filter(fileInfo -> fileInfo.getUploadTime().isBefore(threshold))
                .map(FileInfo::getFileId)
                .toList();

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
        if (!Boolean.TRUE.equals(properties.getAccessTokenEnabled())) {
            return;
        }

        if (token == null || token.trim().isEmpty()) {
            throw new UnauthorizedAccessException(ErrorCode.TOKEN_REQUIRED);
        }

        if (!token.equals(fileInfo.getAccessToken())) {
            throw new UnauthorizedAccessException(ErrorCode.TOKEN_INVALID);
        }

        if (fileInfo.getTokenExpireTime() != null && 
            LocalDateTime.now().isAfter(fileInfo.getTokenExpireTime())) {
            throw new UnauthorizedAccessException(ErrorCode.TOKEN_EXPIRED);
        }
    }

    @Override
    public String refreshAccessToken(String fileId) {
        FileInfo fileInfo = getFileInfo(fileId);
        
        String newToken = tokenGenerator.generateAccessToken(fileId);
        fileInfo.setAccessToken(newToken);
        fileInfo.setTokenExpireTime(LocalDateTime.now().plusSeconds(properties.getAccessTokenExpire()));
        
        metadataRepository.save(fileInfo);
        
        log.info("Access token refreshed for file: {}", fileId);
        return newToken;
    }
}