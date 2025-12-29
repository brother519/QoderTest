package com.photoservice.controller;

import com.photoservice.config.FileProperties;
import com.photoservice.dto.ApiResponse;
import com.photoservice.dto.FileInfo;
import com.photoservice.service.FileService;
import com.photoservice.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "File upload and download APIs")
public class FileController {

    private final FileService fileService;
    private final FileProperties fileProperties;

    @PostMapping("/upload")
    @Operation(summary = "Upload a single file", description = "Upload a single image file")
    public ResponseEntity<ApiResponse<FileInfo>> uploadFile(
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        SecurityUtils.validateReferer(request, fileProperties);
        
        FileInfo fileInfo = fileService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileInfo));
    }

    @PostMapping("/upload/multiple")
    @Operation(summary = "Upload multiple files", description = "Upload multiple image files")
    public ResponseEntity<ApiResponse<List<FileInfo>>> uploadFiles(
            @Parameter(description = "Files to upload") @RequestParam("files") List<MultipartFile> files,
            HttpServletRequest request) {
        
        SecurityUtils.validateReferer(request, fileProperties);
        
        List<FileInfo> fileInfos = fileService.uploadFiles(files);
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", fileInfos));
    }

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download a file", description = "Download a file by filename")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "File name") @PathVariable String fileName,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        
        SecurityUtils.validateReferer(request, fileProperties);
        SecurityUtils.sanitizeFileName(fileName);

        Resource resource = fileService.downloadFile(fileName);
        FileInfo fileInfo = fileService.getFileInfo(fileName);

        String rangeHeader = request.getHeader(HttpHeaders.RANGE);
        
        if (fileProperties.getDownload().getEnableRangeSupport() && rangeHeader != null) {
            return handleRangeRequest(resource, fileInfo, rangeHeader, response);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileInfo.getOriginalFileName() + "\"")
                .cacheControl(CacheControl.maxAge(fileProperties.getDownload().getCacheControlMaxAge(), java.util.concurrent.TimeUnit.SECONDS))
                .body(resource);
    }

    @GetMapping("/preview/{fileName:.+}")
    @Operation(summary = "Preview a file", description = "Preview a file in browser")
    public ResponseEntity<Resource> previewFile(
            @Parameter(description = "File name") @PathVariable String fileName,
            HttpServletRequest request) {
        
        SecurityUtils.validateReferer(request, fileProperties);
        SecurityUtils.sanitizeFileName(fileName);

        Resource resource = fileService.downloadFile(fileName);
        FileInfo fileInfo = fileService.getFileInfo(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileInfo.getOriginalFileName() + "\"")
                .cacheControl(CacheControl.maxAge(fileProperties.getDownload().getCacheControlMaxAge(), java.util.concurrent.TimeUnit.SECONDS))
                .body(resource);
    }

    @DeleteMapping("/{fileName:.+}")
    @Operation(summary = "Delete a file", description = "Delete a file by filename")
    public ResponseEntity<ApiResponse<Boolean>> deleteFile(
            @Parameter(description = "File name") @PathVariable String fileName,
            HttpServletRequest request) {
        
        SecurityUtils.validateReferer(request, fileProperties);
        SecurityUtils.sanitizeFileName(fileName);

        boolean deleted = fileService.deleteFile(fileName);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", deleted));
    }

    @GetMapping("/info/{fileName:.+}")
    @Operation(summary = "Get file information", description = "Get detailed information about a file")
    public ResponseEntity<ApiResponse<FileInfo>> getFileInfo(
            @Parameter(description = "File name") @PathVariable String fileName) {
        
        SecurityUtils.sanitizeFileName(fileName);
        
        FileInfo fileInfo = fileService.getFileInfo(fileName);
        return ResponseEntity.ok(ApiResponse.success(fileInfo));
    }

    @GetMapping("/list")
    @Operation(summary = "List all files", description = "Get a list of all uploaded files")
    public ResponseEntity<ApiResponse<List<FileInfo>>> listFiles() {
        List<FileInfo> files = fileService.listFiles();
        return ResponseEntity.ok(ApiResponse.success(files));
    }

    @GetMapping("/storage/size")
    @Operation(summary = "Get storage size", description = "Get total storage size used")
    public ResponseEntity<ApiResponse<Long>> getStorageSize() {
        long size = fileService.getStorageSize();
        return ResponseEntity.ok(ApiResponse.success(size));
    }

    private ResponseEntity<Resource> handleRangeRequest(
            Resource resource, 
            FileInfo fileInfo, 
            String rangeHeader,
            HttpServletResponse response) throws IOException {
        
        long fileSize = fileInfo.getFileSize();
        long start = 0;
        long end = fileSize - 1;

        String[] ranges = rangeHeader.replace("bytes=", "").split("-");
        start = Long.parseLong(ranges[0]);
        if (ranges.length > 1 && !ranges[1].isEmpty()) {
            end = Long.parseLong(ranges[1]);
        }

        long contentLength = end - start + 1;

        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize);
        response.setHeader(HttpHeaders.ACCEPT_RANGES, "bytes");
        response.setContentLengthLong(contentLength);
        response.setContentType(fileInfo.getContentType());

        try (InputStream inputStream = fileService.downloadFileAsStream(fileInfo.getFileName());
             OutputStream outputStream = response.getOutputStream()) {
            
            inputStream.skip(start);
            byte[] buffer = new byte[8192];
            long bytesWritten = 0;
            int bytesRead;

            while (bytesWritten < contentLength && (bytesRead = inputStream.read(buffer)) != -1) {
                long remaining = contentLength - bytesWritten;
                int toWrite = (int) Math.min(bytesRead, remaining);
                outputStream.write(buffer, 0, toWrite);
                bytesWritten += toWrite;
            }
            outputStream.flush();
        }

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).build();
    }
}
