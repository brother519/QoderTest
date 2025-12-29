package com.photoservice.service;

import com.photoservice.dto.FileInfo;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface FileService {
    
    FileInfo uploadFile(MultipartFile file);
    
    List<FileInfo> uploadFiles(List<MultipartFile> files);
    
    Resource downloadFile(String fileName);
    
    InputStream downloadFileAsStream(String fileName);
    
    boolean deleteFile(String fileName);
    
    FileInfo getFileInfo(String fileName);
    
    List<FileInfo> listFiles();
    
    void validateFile(MultipartFile file);
    
    long getStorageSize();
}
