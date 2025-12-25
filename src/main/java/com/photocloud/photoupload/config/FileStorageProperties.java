package com.photocloud.photoupload.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "file.upload")
public class FileStorageProperties {
    private String path;
    private String allowedExtensions;
    private Long maxSize;
    private Long compressThreshold;
    private Double compressQuality;
    private Boolean accessTokenEnabled;
    private Integer accessTokenExpire;
}
