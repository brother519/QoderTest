package com.photoservice.task;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileCleanupTask {

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${storage.cleanup.enabled:true}")
    private boolean cleanupEnabled;

    @Value("${storage.cleanup.max-age-days:30}")
    private int maxAgeDays;

    @Scheduled(cron = "${storage.cleanup.cron:0 0 2 * * ?}")
    public void cleanupOldFiles() {
        if (!cleanupEnabled) {
            log.info("File cleanup is disabled");
            return;
        }

        log.info("Starting scheduled file cleanup task");
        
        try {
            Path path = Paths.get(uploadPath);
            if (!Files.exists(path)) {
                log.warn("Upload path does not exist: {}", uploadPath);
                return;
            }

            Instant cutoffTime = Instant.now().minus(maxAgeDays, ChronoUnit.DAYS);
            
            try (Stream<Path> files = Files.walk(path, 1)) {
                long deletedCount = files
                        .filter(Files::isRegularFile)
                        .filter(file -> {
                            try {
                                Instant lastModified = Files.getLastModifiedTime(file).toInstant();
                                return lastModified.isBefore(cutoffTime);
                            } catch (IOException e) {
                                log.error("Error checking file: {}", file, e);
                                return false;
                            }
                        })
                        .peek(file -> log.info("Deleting old file: {}", file.getFileName()))
                        .filter(file -> {
                            try {
                                Files.delete(file);
                                return true;
                            } catch (IOException e) {
                                log.error("Error deleting file: {}", file, e);
                                return false;
                            }
                        })
                        .count();

                log.info("File cleanup completed. Deleted {} files older than {} days", deletedCount, maxAgeDays);
            }

        } catch (IOException e) {
            log.error("Error during file cleanup", e);
        }
    }

    @Scheduled(fixedRate = 3600000)
    public void monitorStorage() {
        try {
            Path path = Paths.get(uploadPath);
            if (!Files.exists(path)) {
                return;
            }

            try (Stream<Path> files = Files.walk(path)) {
                long totalSize = files
                        .filter(Files::isRegularFile)
                        .mapToLong(file -> {
                            try {
                                return Files.size(file);
                            } catch (IOException e) {
                                return 0L;
                            }
                        })
                        .sum();

                long totalSizeGB = totalSize / (1024 * 1024 * 1024);
                log.info("Current storage usage: {} GB", totalSizeGB);

            }
        } catch (IOException e) {
            log.error("Error monitoring storage", e);
        }
    }
}
