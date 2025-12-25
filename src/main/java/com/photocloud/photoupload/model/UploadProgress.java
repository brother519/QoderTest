package com.photocloud.photoupload.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadProgress {
    private String fileId;
    private String filename;
    private Long totalBytes;
    private Long uploadedBytes;
    private Integer percentage;
    private String status;
}
