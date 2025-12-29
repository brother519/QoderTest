package com.photoservice.util;

import com.photoservice.config.FileProperties;
import com.photoservice.exception.InvalidFileException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@Slf4j
public class SecurityUtils {

    public static void validateReferer(HttpServletRequest request, FileProperties fileProperties) {
        if (!fileProperties.getDownload().getEnableRefererCheck()) {
            return;
        }

        String referer = request.getHeader("Referer");
        if (StringUtils.isEmpty(referer)) {
            log.warn("Request without referer from IP: {}", request.getRemoteAddr());
            return;
        }

        List<String> allowedReferers = fileProperties.getDownload().getAllowedReferers();
        boolean isAllowed = allowedReferers.stream()
                .anyMatch(allowed -> referer.contains(allowed));

        if (!isAllowed) {
            log.warn("Request from unauthorized referer: {} from IP: {}", referer, request.getRemoteAddr());
            throw new InvalidFileException("Unauthorized access");
        }
    }

    public static void sanitizeFileName(String fileName) {
        if (StringUtils.isEmpty(fileName)) {
            throw new InvalidFileException("File name is empty");
        }

        if (fileName.contains("..")) {
            log.warn("Path traversal attempt detected: {}", fileName);
            throw new InvalidFileException("Invalid file name");
        }

        if (fileName.matches(".*[\\\\/:*?\"<>|].*")) {
            log.warn("Invalid characters in file name: {}", fileName);
            throw new InvalidFileException("Invalid file name");
        }
    }

    public static String escapeHtml(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input);
    }

    public static String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        
        String sanitized = input.trim();
        sanitized = sanitized.replaceAll("[<>\"']", "");
        
        return sanitized;
    }

    public static boolean isValidContentType(String contentType, List<String> allowedTypes) {
        if (StringUtils.isEmpty(contentType)) {
            return false;
        }

        return allowedTypes.stream()
                .anyMatch(allowed -> contentType.toLowerCase().contains(allowed.toLowerCase()));
    }
}
