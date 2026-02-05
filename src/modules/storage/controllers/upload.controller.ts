import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { ChunkService } from '../services/chunk.service';
import { InitiateUploadDto } from '../dto/initiate-upload.dto';
import { CompleteUploadDto } from '../dto/complete-upload.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private chunkService: ChunkService) {}

  @Post('initiate')
  @ApiOperation({ summary: '初始化分片上传' })
  async initiateUpload(@CurrentUser() user: JwtPayload, @Body() dto: InitiateUploadDto) {
    return this.chunkService.initiateUpload(user.userId, dto);
  }

  @Put(':sessionId/chunks/:partNumber')
  @ApiOperation({ summary: '上传单个分片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @Param('sessionId') sessionId: string,
    @Param('partNumber', ParseIntPipe) partNumber: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.chunkService.handleChunkUpload(sessionId, partNumber, file.buffer);
  }

  @Post(':sessionId/complete')
  @ApiOperation({ summary: '完成分片上传' })
  async completeUpload(@Param('sessionId') sessionId: string, @Body() dto: CompleteUploadDto) {
    return this.chunkService.completeUpload(sessionId, dto);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: '查询上传进度' })
  async getUploadProgress(@Param('sessionId') sessionId: string) {
    return this.chunkService.getUploadProgress(sessionId);
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: '取消上传' })
  async cancelUpload(@Param('sessionId') sessionId: string, @CurrentUser() user: JwtPayload) {
    return this.chunkService.cancelUpload(sessionId, user.userId);
  }
}
