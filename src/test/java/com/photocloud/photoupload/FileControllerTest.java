package com.photocloud.photoupload;

import com.photocloud.photoupload.controller.FileController;
import com.photocloud.photoupload.model.FileInfo;
import com.photocloud.photoupload.service.IFileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("File Controller Tests")
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FileController fileController;

    @MockBean
    private IFileStorageService fileStorageService;

    private FileInfo mockFileInfo;

    @BeforeEach
    void setUp() {
        mockFileInfo = FileInfo.builder()
                .fileId("abc123def456")
                .originalFilename("test.jpg")
                .savedFilename("20240101_test.jpg")
                .contentType("image/jpeg")
                .size(1024L)
                .extension("jpg")
                .filePath("/uploads/20240101_test.jpg")
                .uploadTime(LocalDateTime.now())
                .accessToken("token123")
                .build();
    }

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        assertNotNull(fileController);
    }

    @Test
    @DisplayName("Health check returns UP status")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/files/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    @DisplayName("Upload file successfully")
    void testUploadFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test content".getBytes()
        );

        when(fileStorageService.uploadFile(any())).thenReturn(mockFileInfo);

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fileId").value("abc123def456"))
                .andExpect(jsonPath("$.data.originalFilename").value("test.jpg"));
    }

    @Test
    @DisplayName("List all files successfully")
    void testListFiles() throws Exception {
        List<FileInfo> fileList = Arrays.asList(mockFileInfo);
        when(fileStorageService.listAllFiles()).thenReturn(fileList);

        mockMvc.perform(get("/api/files/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Get storage usage successfully")
    void testGetStorageUsage() throws Exception {
        when(fileStorageService.getStorageUsage()).thenReturn(1024L);
        when(fileStorageService.listAllFiles()).thenReturn(Arrays.asList(mockFileInfo));

        mockMvc.perform(get("/api/files/storage/usage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalBytes").value(1024))
                .andExpect(jsonPath("$.data.fileCount").value(1));
    }

    @Test
    @DisplayName("Get file info successfully")
    void testGetFileInfo() throws Exception {
        when(fileStorageService.getFileInfo("abc123def456")).thenReturn(mockFileInfo);

        mockMvc.perform(get("/api/files/info/abc123def456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fileId").value("abc123def456"));
    }

    @Test
    @DisplayName("Delete file successfully")
    void testDeleteFile() throws Exception {
        mockMvc.perform(delete("/api/files/abc123def456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    private void assertNotNull(Object obj) {
        if (obj == null) {
            throw new AssertionError("Object should not be null");
        }
    }
}