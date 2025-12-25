package com.photocloud.photoupload;

import com.photocloud.photoupload.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FileStorageServiceTest {

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    void contextLoads() {
        assertNotNull(fileStorageService);
    }

    @Test
    void testUploadValidImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        assertDoesNotThrow(() -> {
            var fileInfo = fileStorageService.uploadFile(file);
            assertNotNull(fileInfo);
            assertNotNull(fileInfo.getFileId());
            assertEquals("test.jpg", fileInfo.getOriginalFilename());
        });
    }

    @Test
    void testStorageUsage() {
        long usage = fileStorageService.getStorageUsage();
        assertTrue(usage >= 0);
    }

    @Test
    void testListAllFiles() {
        var files = fileStorageService.listAllFiles();
        assertNotNull(files);
    }
}
