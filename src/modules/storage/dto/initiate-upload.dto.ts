import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';

export class InitiateUploadDto {
  @ApiProperty({ description: '文件名', example: 'document.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ description: '文件大小(字节)', example: 104857600 })
  @IsNumber()
  @Min(1)
  fileSize: number;

  @ApiProperty({ description: 'MIME类型', example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: '分片大小(字节)', example: 5242880, required: false })
  @IsNumber()
  @IsOptional()
  @Min(5242880) // 最小5MB
  chunkSize?: number;

  @ApiProperty({ description: '访问级别', enum: AccessLevel, default: AccessLevel.private })
  @IsEnum(AccessLevel)
  @IsOptional()
  accessLevel?: AccessLevel;

  @ApiProperty({ description: '过期时间(秒)', example: 86400, required: false })
  @IsNumber()
  @IsOptional()
  expiresIn?: number;
}
