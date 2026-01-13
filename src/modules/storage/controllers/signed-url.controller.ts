import { Controller, Post, Get, Param, Body, UseGuards, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { AccessControlService } from '../services/access-control.service';
import { GenerateSignedUrlDto } from '../dto/generate-signed-url.dto';

@ApiTags('Signed URLs')
@Controller()
export class SignedUrlController {
  constructor(private accessControlService: AccessControlService) {}

  @Post('files/:fileId/signed-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '生成签名URL' })
  async generateSignedUrl(
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateSignedUrlDto,
  ) {
    return this.accessControlService.generateSignedUrl(
      fileId,
      user.userId,
      dto.operation,
      dto.expiresIn || 3600,
      dto.maxUses,
    );
  }

  @Get('signed/:token')
  @ApiOperation({ summary: '通过签名令牌访问文件' })
  @Redirect()
  async accessWithSignedUrl(@Param('token') token: string) {
    const result = await this.accessControlService.getSignedDownloadUrl(token);
    return { url: result.url };
  }
}
