package com.photocloud.photoupload.constants;

public final class ErrorCode {
    
    public static final int SUCCESS = 200;
    public static final int BAD_REQUEST = 400;
    public static final int UNAUTHORIZED = 401;
    public static final int NOT_FOUND = 404;
    public static final int PAYLOAD_TOO_LARGE = 413;
    public static final int INTERNAL_SERVER_ERROR = 500;
    
    public static final String FILE_EMPTY = "File is empty or null";
    public static final String FILE_SIZE_EXCEEDED = "File size exceeds maximum allowed size";
    public static final String INVALID_FILE_EXTENSION = "File extension is not allowed";
    public static final String INVALID_FILENAME = "Filename is invalid";
    public static final String INVALID_CONTENT_TYPE = "File content type is not an image";
    public static final String FILE_NOT_FOUND = "File not found";
    public static final String FILE_STORAGE_ERROR = "File storage error occurred";
    public static final String TOKEN_REQUIRED = "Access token is required";
    public static final String TOKEN_INVALID = "Invalid access token";
    public static final String TOKEN_EXPIRED = "Access token has expired";
    
    private ErrorCode() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
