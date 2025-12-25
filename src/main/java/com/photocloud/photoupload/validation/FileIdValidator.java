package com.photocloud.photoupload.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class FileIdValidator implements ConstraintValidator<ValidFileId, String> {

    private static final String FILE_ID_PATTERN = "^[a-f0-9]{32}$";

    @Override
    public void initialize(ValidFileId constraintAnnotation) {
    }

    @Override
    public boolean isValid(String fileId, ConstraintValidatorContext context) {
        if (fileId == null || fileId.trim().isEmpty()) {
            return false;
        }
        return fileId.matches(FILE_ID_PATTERN);
    }
}
