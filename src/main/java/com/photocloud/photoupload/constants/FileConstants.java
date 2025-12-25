package com.photocloud.photoupload.constants;

public final class FileConstants {
    
    public static final String TEMP_FILE_PREFIX = "upload_";
    public static final String COMPRESSED_FILE_PREFIX = "compressed_";
    public static final String THUMBNAIL_FILE_PREFIX = "thumb_";
    
    public static final int MAX_IMAGE_WIDTH = 1920;
    public static final int MAX_IMAGE_HEIGHT = 1920;
    public static final int DEFAULT_THUMBNAIL_SIZE = 200;
    
    public static final String IMAGE_CONTENT_TYPE_PREFIX = "image/";
    
    public static final String CACHE_FILE_METADATA = "fileMetadata";
    public static final String CACHE_ACCESS_TOKENS = "accessTokens";
    
    private FileConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
