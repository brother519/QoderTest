package com.photoservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileUrl;
    private Long fileSize;
    private String contentType;
    private String extension;
    private Long uploadTime;
    private String md5;
}
