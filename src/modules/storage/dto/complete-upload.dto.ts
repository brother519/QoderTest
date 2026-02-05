import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PartDto {
  @ApiProperty({ description: '分片编号', example: 1 })
  PartNumber: number;

  @ApiProperty({ description: 'ETag', example: '"abc123def456"' })
  ETag: string;
}

export class CompleteUploadDto {
  @ApiProperty({ description: '已上传的分片列表', type: [PartDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}
