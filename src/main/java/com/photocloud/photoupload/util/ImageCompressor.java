package com.photocloud.photoupload.util;

import com.photocloud.photoupload.constants.FileConstants;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ImageCompressor {

    @Value("${file.upload.compress-quality}")
    private Double compressQuality;

    public File compressImage(File originalFile, File outputFile) throws IOException {
        try {
            BufferedImage originalImage = ImageIO.read(originalFile);
            
            if (originalImage == null) {
                throw new IOException("Cannot read image file: " + originalFile.getName());
            }

            double scale = calculateScale(originalImage.getWidth(), originalImage.getHeight());

            Thumbnails.of(originalFile)
                    .scale(scale)
                    .outputQuality(compressQuality)
                    .toFile(outputFile);

            log.info("Image compressed: original size={} bytes, compressed size={} bytes, scale={}", 
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

            log.info("Thumbnail created: {} (size: {} bytes)", thumbnailFile.getName(), thumbnailFile.length());
            return thumbnailFile;
        } catch (IOException e) {
            log.error("Error creating thumbnail: {}", e.getMessage(), e);
            throw e;
        }
    }

    private double calculateScale(int width, int height) {
        if (width <= FileConstants.MAX_IMAGE_WIDTH && height <= FileConstants.MAX_IMAGE_HEIGHT) {
            return 1.0;
        }
        return Math.min(
                (double) FileConstants.MAX_IMAGE_WIDTH / width, 
                (double) FileConstants.MAX_IMAGE_HEIGHT / height
        );
    }
}