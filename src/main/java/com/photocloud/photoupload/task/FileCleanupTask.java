package com.photocloud.photoupload.task;

import com.photocloud.photoupload.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class FileCleanupTask {

    private final FileStorageService fileStorageService;

    @Value("${file.cleanup.days-old:30}")
    private int daysOld;

    @Scheduled(cron = "${file.cleanup.cron:0 0 2 * * ?}")
    public void cleanupExpiredFiles() {
        log.info("Starting scheduled file cleanup task at {}", LocalDateTime.now());
        
        try {
            fileStorageService.cleanupExpiredFiles(daysOld);
            
            long storageUsage = fileStorageService.getStorageUsage();
            log.info("File cleanup completed. Current storage usage: {} MB", 
                    storageUsage / (1024.0 * 1024.0));
        } catch (Exception e) {
            log.error("Error during file cleanup task", e);
        }
    }

    @Scheduled(fixedRate = 3600000)
    public void logStorageStatus() {
        try {
            long usage = fileStorageService.getStorageUsage();
            int fileCount = fileStorageService.listAllFiles().size();
            
            log.info("Storage status - Files: {}, Usage: {} MB", 
                    fileCount, usage / (1024.0 * 1024.0));
        } catch (Exception e) {
            log.error("Error logging storage status", e);
        }
    }
}
