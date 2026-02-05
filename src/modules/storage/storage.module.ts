import { Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { ChunkService } from './services/chunk.service';
import { MetadataService } from './services/metadata.service';
import { AccessControlService } from './services/access-control.service';
import { UploadController } from './controllers/upload.controller';
import { FileController } from './controllers/file.controller';
import { SignedUrlController } from './controllers/signed-url.controller';

@Module({
  providers: [S3Service, ChunkService, MetadataService, AccessControlService],
  controllers: [UploadController, FileController, SignedUrlController],
  exports: [S3Service, ChunkService, MetadataService, AccessControlService],
})
export class StorageModule {}
