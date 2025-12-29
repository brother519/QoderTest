package com.photoservice.service.impl;

import com.photoservice.config.FileProperties;
import com.photoservice.dto.FileInfo;
import com.photoservice.exception.FileNotFoundException;
import com.photoservice.exception.FileStorageException;
import com.photoservice.exception.InvalidFileException;
import com.photoservice.service.FileService;
import com.photoservice.util.FileUtils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileProperties fileProperties;
    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            String uploadDir = fileProperties.getUpload().getPath();
            if (uploadDir == null || uploadDir.isEmpty()) {
                uploadDir = System.getProperty("user.home") + "/photo-storage/uploads";
            }
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            log.info("Upload directory initialized: {}", uploadPath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    @Override
    @CacheEvict(value = "files", allEntries = true)
    public FileInfo uploadFile(MultipartFile file) {
        validateFile(file);

        try {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = FilenameUtils.getExtension(originalFileName);
            String fileName = generateUniqueFileName(extension);
            Path targetPath = uploadPath.resolve(fileName);

            if (fileProperties.getUpload().getEnableCompression() &&
                file.getSize() > fileProperties.getUpload().getCompressionThreshold()) {
                compressAndSaveImage(file, targetPath);
            } else {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String md5 = calculateMD5(targetPath);

            log.info("File uploaded successfully: {} -> {}", originalFileName, fileName);

            return FileInfo.builder()
                    .fileName(fileName)
                    .originalFileName(originalFileName)
                    .filePath(targetPath.toString())
                    .fileUrl("/api/files/download/" + fileName)
                    .fileSize(Files.size(targetPath))
                    .contentType(file.getContentType())
                    .extension(extension)
                    .uploadTime(System.currentTimeMillis())
                    .md5(md5)
                    .build();

        } catch (IOException ex) {
            log.error("Failed to upload file: {}", file.getOriginalFilename(), ex);
            throw new FileStorageException("Failed to store file", ex);
        }
    }

    @Override
    @CacheEvict(value = "files", allEntries = true)
    public List<FileInfo> uploadFiles(List<MultipartFile> files) {
        List<FileInfo> fileInfos = new ArrayList<>();
        for (MultipartFile file : files) {
            fileInfos.add(uploadFile(file));
        }
        return fileInfos;
    }

    @Override
    @Cacheable(value = "files", key = "#fileName")
    public Resource downloadFile(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            
            if (!filePath.startsWith(uploadPath)) {
                throw new FileStorageException("Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                log.info("File downloaded: {}", fileName);
                return resource;
            } else {
                throw new FileNotFoundException("File not found: " + fileName);
            }
        } catch (IOException ex) {
            throw new FileNotFoundException("File not found: " + fileName, ex);
        }
    }

    @Override
    public InputStream downloadFileAsStream(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            
            if (!filePath.startsWith(uploadPath)) {
                throw new FileStorageException("Invalid file path");
            }

            if (!Files.exists(filePath)) {
                throw new FileNotFoundException("File not found: " + fileName);
            }

            return Files.newInputStream(filePath);
        } catch (IOException ex) {
            throw new FileNotFoundException("File not found: " + fileName, ex);
        }
    }

    @Override
    @CacheEvict(value = "files", allEntries = true)
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            
            if (!filePath.startsWith(uploadPath)) {
                throw new FileStorageException("Invalid file path");
            }

            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("File deleted: {}", fileName);
            }
            return deleted;
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", fileName, ex);
            throw new FileStorageException("Failed to delete file", ex);
        }
    }

    @Override
    public FileInfo getFileInfo(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            
            if (!filePath.startsWith(uploadPath)) {
                throw new FileStorageException("Invalid file path");
            }

            if (!Files.exists(filePath)) {
                throw new FileNotFoundException("File not found: " + fileName);
            }

            String extension = FilenameUtils.getExtension(fileName);
            String contentType = Files.probeContentType(filePath);

            return FileInfo.builder()
                    .fileName(fileName)
                    .filePath(filePath.toString())
                    .fileUrl("/api/files/download/" + fileName)
                    .fileSize(Files.size(filePath))
                    .contentType(contentType)
                    .extension(extension)
                    .uploadTime(Files.getLastModifiedTime(filePath).toMillis())
                    .build();

        } catch (IOException ex) {
            throw new FileStorageException("Failed to get file info", ex);
        }
    }

    @Override
    @Cacheable(value = "fileList")
    public List<FileInfo> listFiles() {
        List<FileInfo> fileInfos = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(uploadPath, 1)) {
            paths.filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            String fileName = path.getFileName().toString();
                            fileInfos.add(getFileInfo(fileName));
                        } catch (Exception e) {
                            log.error("Error processing file: {}", path, e);
                        }
                    });
        } catch (IOException ex) {
            log.error("Failed to list files", ex);
            throw new FileStorageException("Failed to list files", ex);
        }
        return fileInfos;
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new InvalidFileException("File name is invalid");
        }

        if (FileUtils.containsInvalidCharacters(originalFileName)) {
            throw new InvalidFileException("File name contains invalid characters");
        }

        String extension = FilenameUtils.getExtension(originalFileName).toLowerCase();
        List<String> allowedExtensions = fileProperties.getUpload().getAllowedExtensions();
        if (!allowedExtensions.contains(extension)) {
            throw new InvalidFileException("File type not allowed. Allowed types: " + allowedExtensions);
        }

        Long maxSize = fileProperties.getUpload().getMaxSize();
        if (file.getSize() > maxSize) {
            throw new InvalidFileException("File size exceeds maximum allowed size: " + maxSize + " bytes");
        }

        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new InvalidFileException("File is not an image");
            }
        } catch (Exception e) {
            throw new InvalidFileException("Failed to validate file type", e);
        }
    }

    @Override
    public long getStorageSize() {
        try (Stream<Path> paths = Files.walk(uploadPath)) {
            return paths.filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            return 0L;
                        }
                    })
                    .sum();
        } catch (IOException ex) {
            log.error("Failed to calculate storage size", ex);
            return 0L;
        }
    }

    private String generateUniqueFileName(String extension) {
        return UUID.randomUUID().toString() + "." + extension;
    }

    private void compressAndSaveImage(MultipartFile file, Path targetPath) throws IOException {
        double quality = fileProperties.getUpload().getCompressionQuality();
        
        try (InputStream inputStream = file.getInputStream();
             OutputStream outputStream = Files.newOutputStream(targetPath)) {
            Thumbnails.of(inputStream)
                    .scale(1.0)
                    .outputQuality(quality)
                    .toOutputStream(outputStream);
        }
        
        log.info("Image compressed with quality: {}", quality);
    }

    private String calculateMD5(Path filePath) {
        try (InputStream is = Files.newInputStream(filePath)) {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) > 0) {
                digest.update(buffer, 0, read);
            }
            byte[] md5Bytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : md5Bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to calculate MD5", e);
            return null;
        }
    }
}
