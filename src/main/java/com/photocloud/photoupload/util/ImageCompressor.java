package com.photocloud.photoupload.util;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Slf4j
@Component
public class ImageCompressor {

    @Value("${file.upload.compress-quality}")
    private Double compressQuality;

    public File compressImage(File originalFile, File outputFile) throws IOException {
        try {
            BufferedImage originalImage = ImageIO.read(originalFile);
            
            if (originalImage == null) {
                throw new IOException("Cannot read image file: " + originalFile.getName());
            }

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            double scale = 1.0;
            if (width > 1920 || height > 1920) {
                scale = Math.min(1920.0 / width, 1920.0 / height);
            }

            Thumbnails.of(originalFile)
                    .scale(scale)
                    .outputQuality(compressQuality)
                    .toFile(outputFile);

            log.info("Image compressed: original size={}, compressed size={}, scale={}", 
                    originalFile.length(), outputFile.length(), scale);

            return outputFile;
        } catch (IOException e) {
            log.error("Error compressing image: {}", e.getMessage(), e);
            throw e;
        }
    }

    public File createThumbnail(File originalFile, File thumbnailFile, int size) throws IOException {
        try {
            Thumbnails.of(originalFile)
                    .size(size, size)
                    .outputQuality(0.8)
                    .toFile(thumbnailFile);

            log.info("Thumbnail created: {}", thumbnailFile.getName());
            return thumbnailFile;
        } catch (IOException e) {
            log.error("Error creating thumbnail: {}", e.getMessage(), e);
            throw e;
        }
    }
}
