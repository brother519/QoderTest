import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { MetadataService } from '../services/metadata.service';
import { AccessLevel } from '@prisma/client';

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(private metadataService: MetadataService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取用户文件列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc' })
  async listFiles(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc',
  ) {
    return this.metadataService.listUserFiles(user.userId, page, limit, sortBy, order);
  }

  @Get(':fileId')
  @ApiOperation({ summary: '获取文件详情' })
  async getFile(@Param('fileId') fileId: string, @CurrentUser() user?: JwtPayload) {
    return this.metadataService.getFileById(fileId, user?.userId);
  }

  @Get(':fileId/download')
  @ApiOperation({ summary: '下载文件' })
  @Redirect()
  async downloadFile(@Param('fileId') fileId: string, @CurrentUser() user?: JwtPayload) {
    const result = await this.metadataService.getDownloadUrl(fileId, user?.userId);
    return { url: result.url };
  }

  @Delete(':fileId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(@Param('fileId') fileId: string, @CurrentUser() user: JwtPayload) {
    return this.metadataService.deleteFile(fileId, user.userId);
  }

  @Patch(':fileId/access')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '修改文件访问级别' })
  async updateAccessLevel(
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
    @Body('accessLevel') accessLevel: AccessLevel,
  ) {
    return this.metadataService.updateAccessLevel(fileId, user.userId, accessLevel);
  }
}
