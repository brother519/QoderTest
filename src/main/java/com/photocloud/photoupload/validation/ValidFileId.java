package com.photocloud.photoupload.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileIdValidator.class)
@Documented
public @interface ValidFileId {
    String message() default "Invalid file ID format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
