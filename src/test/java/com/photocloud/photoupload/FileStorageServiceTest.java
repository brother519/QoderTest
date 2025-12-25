package com.photocloud.photoupload;

import com.photocloud.photoupload.exception.InvalidFileException;
import com.photocloud.photoupload.model.FileInfo;
import com.photocloud.photoupload.service.IFileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("File Storage Service Tests")
class FileStorageServiceTest {

    @Autowired
    private IFileStorageService fileStorageService;

    private MockMultipartFile validImageFile;
    private MockMultipartFile invalidFile;

    @BeforeEach
    void setUp() {
        validImageFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        invalidFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );
    }

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        assertNotNull(fileStorageService);
    }

    @Test
    @DisplayName("Upload valid image file successfully")
    void testUploadValidImageFile() {
        FileInfo fileInfo = fileStorageService.uploadFile(validImageFile);
        
        assertNotNull(fileInfo);
        assertNotNull(fileInfo.getFileId());
        assertEquals("test.jpg", fileInfo.getOriginalFilename());
        assertEquals("image/jpeg", fileInfo.getContentType());
        assertTrue(fileInfo.getSize() > 0);
        assertNotNull(fileInfo.getUploadTime());
    }

    @Test
    @DisplayName("Throw exception when uploading invalid file type")
    void testUploadInvalidFileType() {
        assertThrows(InvalidFileException.class, () -> {
            fileStorageService.uploadFile(invalidFile);
        });
    }

    @Test
    @DisplayName("Throw exception when uploading null file")
    void testUploadNullFile() {
        assertThrows(InvalidFileException.class, () -> {
            fileStorageService.uploadFile(null);
        });
    }

    @Test
    @DisplayName("Throw exception when uploading empty file")
    void testUploadEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThrows(InvalidFileException.class, () -> {
            fileStorageService.uploadFile(emptyFile);
        });
    }

    @Test
    @DisplayName("Upload multiple files successfully")
    void testUploadMultipleFiles() {
        MockMultipartFile file1 = new MockMultipartFile(
                "files",
                "test1.jpg",
                "image/jpeg",
                "content1".getBytes()
        );

        MockMultipartFile file2 = new MockMultipartFile(
                "files",
                "test2.png",
                "image/png",
                "content2".getBytes()
        );

        MockMultipartFile[] files = {file1, file2};
        List<FileInfo> uploadedFiles = fileStorageService.uploadMultipleFiles(files);

        assertNotNull(uploadedFiles);
        assertTrue(uploadedFiles.size() <= 2);
    }

    @Test
    @DisplayName("Get file info successfully")
    void testGetFileInfo() {
        FileInfo uploadedFile = fileStorageService.uploadFile(validImageFile);
        FileInfo retrievedFile = fileStorageService.getFileInfo(uploadedFile.getFileId());

        assertNotNull(retrievedFile);
        assertEquals(uploadedFile.getFileId(), retrievedFile.getFileId());
        assertEquals(uploadedFile.getOriginalFilename(), retrievedFile.getOriginalFilename());
    }

    @Test
    @DisplayName("Delete file successfully")
    void testDeleteFile() {
        FileInfo uploadedFile = fileStorageService.uploadFile(validImageFile);
        
        assertDoesNotThrow(() -> {
            fileStorageService.deleteFile(uploadedFile.getFileId());
        });
    }

    @Test
    @DisplayName("List all files successfully")
    void testListAllFiles() {
        List<FileInfo> files = fileStorageService.listAllFiles();
        assertNotNull(files);
    }

    @Test
    @DisplayName("Get storage usage")
    void testStorageUsage() {
        long usage = fileStorageService.getStorageUsage();
        assertTrue(usage >= 0);
    }

    @Test
    @DisplayName("Refresh access token successfully")
    void testRefreshAccessToken() {
        FileInfo uploadedFile = fileStorageService.uploadFile(validImageFile);
        
        assertDoesNotThrow(() -> {
            String newToken = fileStorageService.refreshAccessToken(uploadedFile.getFileId());
            assertNotNull(newToken);
            assertFalse(newToken.isEmpty());
        });
    }
}