import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { BaseAdminContentDto, UpdateBaseAdminContentDto } from '../content/dto/content-admin.dto';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { UploadedMediaFile } from '../media/media.types';

@Controller('admin/proverbs')
@UseGuards(AdminJwtGuard)
export class AdminProverbsController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(@Query() query: SearchQueryDto) {
    return this.contentService.getAdminList(ContentType.PROVERB, query);
  }

  @Post()
  create(@Body() payload: BaseAdminContentDto) {
    return this.contentService.createSimple(ContentType.PROVERB, payload);
  }

  @Get('template')
  template(@Res() res: Response) {
    const template = this.contentService.getImportTemplate(ContentType.PROVERB);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    res.send(template.buffer);
  }

  @Post('import-preview')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  preview(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body('mode') mode?: string,
    @Body('skipDuplicates') skipDuplicates?: string,
  ) {
    return this.contentService.previewImport(ContentType.PROVERB, file, mode, skipDuplicates);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  import(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body('mode') mode?: string,
    @Body('skipDuplicates') skipDuplicates?: string,
  ) {
    return this.contentService.importContent(ContentType.PROVERB, file, mode, skipDuplicates);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateBaseAdminContentDto) {
    return this.contentService.updateSimple(ContentType.PROVERB, id, payload);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.delete(ContentType.PROVERB, id);
  }
}
