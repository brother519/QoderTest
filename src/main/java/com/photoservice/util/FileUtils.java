package com.photoservice.util;

import com.photoservice.exception.InvalidFileException;
import org.apache.commons.lang3.StringUtils;

import java.util.regex.Pattern;

public class FileUtils {

    private static final Pattern INVALID_CHARACTERS = Pattern.compile("[\\\\/:*?\"<>|]");
    private static final Pattern PATH_TRAVERSAL = Pattern.compile("\\.\\.");
    private static final int MAX_FILENAME_LENGTH = 255;

    public static boolean containsInvalidCharacters(String fileName) {
        if (StringUtils.isEmpty(fileName)) {
            return true;
        }
        
        if (fileName.length() > MAX_FILENAME_LENGTH) {
            return true;
        }
        
        if (INVALID_CHARACTERS.matcher(fileName).find()) {
            return true;
        }
        
        if (PATH_TRAVERSAL.matcher(fileName).find()) {
            return true;
        }
        
        return false;
    }

    public static String sanitizeFileName(String fileName) {
        if (StringUtils.isEmpty(fileName)) {
            throw new InvalidFileException("File name is empty");
        }
        
        String sanitized = fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
        sanitized = sanitized.replaceAll("\\.\\.", "");
        
        if (sanitized.length() > MAX_FILENAME_LENGTH) {
            sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
        }
        
        return sanitized;
    }

    public static String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", size / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", size / (1024.0 * 1024 * 1024));
        }
    }
}
