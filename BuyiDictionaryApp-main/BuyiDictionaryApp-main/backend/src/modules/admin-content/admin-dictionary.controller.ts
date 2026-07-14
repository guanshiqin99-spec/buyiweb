import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { DictionaryAdminDto, UpdateDictionaryAdminDto } from '../content/dto/content-admin.dto';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { UploadedMediaFile } from '../media/media.types';

@Controller('admin/dictionary')
@UseGuards(AdminJwtGuard)
export class AdminDictionaryController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(@Query() query: SearchQueryDto) {
    return this.contentService.getAdminList(ContentType.DICTIONARY, query);
  }

  @Post()
  create(@Body() payload: DictionaryAdminDto) {
    return this.contentService.createDictionary(payload);
  }

  @Get('template')
  template(@Res() res: Response) {
    const template = this.contentService.getImportTemplate(ContentType.DICTIONARY);
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
    return this.contentService.previewImport(ContentType.DICTIONARY, file, mode, skipDuplicates);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  import(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body('mode') mode?: string,
    @Body('skipDuplicates') skipDuplicates?: string,
  ) {
    return this.contentService.importContent(ContentType.DICTIONARY, file, mode, skipDuplicates);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateDictionaryAdminDto) {
    return this.contentService.updateDictionary(id, payload);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.delete(ContentType.DICTIONARY, id);
  }
}
