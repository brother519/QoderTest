import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Operation } from '@prisma/client';

export class GenerateSignedUrlDto {
  @ApiProperty({ description: '操作类型', enum: Operation, example: Operation.download })
  @IsEnum(Operation)
  operation: Operation;

  @ApiProperty({ description: '过期时间(秒)', example: 3600, default: 3600 })
  @IsNumber()
  @IsOptional()
  @Min(60)
  @Max(604800) // 最长7天
  expiresIn?: number;

  @ApiProperty({ description: '最大使用次数', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxUses?: number;
}
