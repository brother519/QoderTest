package com.photocloud.photoupload.controller;

import com.photocloud.photoupload.aspect.RateLimit;
import com.photocloud.photoupload.model.ApiResponse;
import com.photocloud.photoupload.model.FileInfo;
import com.photocloud.photoupload.service.IFileStorageService;
import com.photocloud.photoupload.validation.ValidFileId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "APIs for photo upload, download, and management")
public class FileController {

    private final IFileStorageService fileStorageService;

    @RateLimit
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single photo", description = "Upload a single image file to the system")
    public ResponseEntity<ApiResponse<FileInfo>> uploadFile(
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") @NotNull MultipartFile file) {
        
        log.info("Received file upload request: {}", file.getOriginalFilename());
        
        FileInfo fileInfo = fileStorageService.uploadFile(file);
        
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileInfo));
    }

    @RateLimit
    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple photos", description = "Upload multiple image files to the system")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadMultipleFiles(
            @Parameter(description = "Image files to upload", required = true)
            @RequestParam("files") @NotNull MultipartFile[] files) {
        
        log.info("Received multiple file upload request: {} files", files.length);
        
        List<FileInfo> uploadedFiles = fileStorageService.uploadMultipleFiles(files);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalFiles", files.length);
        result.put("successCount", uploadedFiles.size());
        result.put("files", uploadedFiles);
        
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", result));
    }

    @GetMapping("/download/{fileId}")
    @Operation(summary = "Download a photo", description = "Download a photo by file ID")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "File ID", required = true)
            @PathVariable String fileId,
            @Parameter(description = "Access token for authentication")
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        
        log.info("Received file download request: fileId={}", fileId);
        
        Resource resource = fileStorageService.loadFileAsResource(fileId, token);
        FileInfo fileInfo = fileStorageService.getFileInfo(fileId);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            log.info("Could not determine file type.");
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + fileInfo.getOriginalFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    @GetMapping("/preview/{fileId}")
    @Operation(summary = "Preview a photo", description = "Preview a photo in browser by file ID")
    public ResponseEntity<Resource> previewFile(
            @Parameter(description = "File ID", required = true)
            @PathVariable String fileId,
            @Parameter(description = "Access token for authentication")
            @RequestParam(required = false) String token,
            HttpServletRequest request) {
        
        log.info("Received file preview request: fileId={}", fileId);
        
        Resource resource = fileStorageService.loadFileAsResource(fileId, token);
        FileInfo fileInfo = fileStorageService.getFileInfo(fileId);

        String contentType = fileInfo.getContentType();
        if (contentType == null) {
            contentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileInfo.getOriginalFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    @GetMapping("/info/{fileId}")
    @Operation(summary = "Get file information", description = "Get metadata of a file by file ID")
    public ResponseEntity<ApiResponse<FileInfo>> getFileInfo(
            @Parameter(description = "File ID", required = true)
            @PathVariable @ValidFileId String fileId) {
        
        log.info("Received file info request: fileId={}", fileId);
        
        FileInfo fileInfo = fileStorageService.getFileInfo(fileId);
        
        return ResponseEntity.ok(ApiResponse.success(fileInfo));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete a photo", description = "Delete a photo by file ID")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @Parameter(description = "File ID", required = true)
            @PathVariable @ValidFileId String fileId) {
        
        log.info("Received file deletion request: fileId={}", fileId);
        
        fileStorageService.deleteFile(fileId);
        
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }

    @GetMapping("/list")
    @Operation(summary = "List all files", description = "Get a list of all uploaded files")
    public ResponseEntity<ApiResponse<List<FileInfo>>> listFiles() {
        log.info("Received list files request");
        
        List<FileInfo> files = fileStorageService.listAllFiles();
        
        return ResponseEntity.ok(ApiResponse.success(files));
    }

    @PostMapping("/token/refresh/{fileId}")
    @Operation(summary = "Refresh access token", description = "Refresh the access token for a file")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(
            @Parameter(description = "File ID", required = true)
            @PathVariable String fileId) {
        
        log.info("Received token refresh request: fileId={}", fileId);
        
        String newToken = fileStorageService.refreshAccessToken(fileId);
        
        Map<String, String> result = new HashMap<>();
        result.put("fileId", fileId);
        result.put("accessToken", newToken);
        
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", result));
    }

    @GetMapping("/storage/usage")
    @Operation(summary = "Get storage usage", description = "Get current storage usage statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStorageUsage() {
        log.info("Received storage usage request");
        
        long usage = fileStorageService.getStorageUsage();
        int fileCount = fileStorageService.listAllFiles().size();
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalBytes", usage);
        result.put("totalMB", usage / (1024.0 * 1024.0));
        result.put("fileCount", fileCount);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the file service is running")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "File Storage Service");
        
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}