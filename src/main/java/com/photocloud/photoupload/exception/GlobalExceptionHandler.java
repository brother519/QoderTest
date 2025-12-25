package com.photocloud.photoupload.exception;

import com.photocloud.photoupload.constants.ErrorCode;
import com.photocloud.photoupload.model.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileStorageException(FileStorageException ex) {
        log.error("File storage error: {}", ex.getMessage(), ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                ErrorCode.INTERNAL_SERVER_ERROR, 
                ex.getMessage()
        );
    }

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidFileException(InvalidFileException ex) {
        log.warn("Invalid file: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST, 
                ErrorCode.BAD_REQUEST, 
                ex.getMessage()
        );
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileNotFoundException(FileNotFoundException ex) {
        log.warn("File not found: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.NOT_FOUND, 
                ErrorCode.NOT_FOUND, 
                ex.getMessage()
        );
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        log.warn("Unauthorized access: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED, 
                ErrorCode.UNAUTHORIZED, 
                ex.getMessage()
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        log.warn("File size exceeds limit: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE, 
                ErrorCode.PAYLOAD_TOO_LARGE, 
                ErrorCode.FILE_SIZE_EXCEEDED
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                ErrorCode.INTERNAL_SERVER_ERROR, 
                "An unexpected error occurred"
        );
    }

    private ResponseEntity<ApiResponse<Void>> buildErrorResponse(
            HttpStatus status, int code, String message) {
        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(code, message));
    }
}