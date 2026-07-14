import {
  Body,
  Controller,
  Delete,
  Get,
  ParseFilePipeBuilder,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { MediaService } from '../media/media.service';
import { UploadMediaDto } from '../media/dto/upload-media.dto';
import { UploadedMediaFile } from '../media/media.types';

@Controller('admin/media')
@UseGuards(AdminJwtGuard)
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list() {
    return this.mediaService.list();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: Number(process.env.MEDIA_MAX_FILE_SIZE ?? 10 * 1024 * 1024),
      },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: 400,
        }),
    )
    file: UploadedMediaFile,
    @Body() payload: UploadMediaDto,
  ) {
    return this.mediaService.upload(file, payload);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
