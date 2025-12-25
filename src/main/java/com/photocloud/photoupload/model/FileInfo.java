package com.photocloud.photoupload.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {
    private String fileId;
    private String originalFilename;
    private String savedFilename;
    private String contentType;
    private Long size;
    private String extension;
    private String filePath;
    private LocalDateTime uploadTime;
    private String accessToken;
    private LocalDateTime tokenExpireTime;
}
