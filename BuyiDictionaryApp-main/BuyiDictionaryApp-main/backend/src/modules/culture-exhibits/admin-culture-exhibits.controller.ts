import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CultureExhibitsService } from './culture-exhibits.service';
import { CreateContentCultureLinkDto, CreateCultureExhibitDto, UpdateCultureExhibitDto } from './dto/culture-exhibit.dto';

@Controller('admin/culture-exhibits')
@UseGuards(AdminJwtGuard)
export class AdminCultureExhibitsController {
  constructor(private readonly cultureExhibitsService: CultureExhibitsService) {}

  @Get()
  list() { return this.cultureExhibitsService.listAdmin(); }

  @Post()
  create(@Body() payload: CreateCultureExhibitDto) { return this.cultureExhibitsService.create(payload); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateCultureExhibitDto) {
    return this.cultureExhibitsService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.cultureExhibitsService.remove(id); }

  @Get('links/all')
  links(@Query('exhibitId') exhibitId?: string) {
    return this.cultureExhibitsService.listLinks(exhibitId ? Number(exhibitId) : undefined);
  }

  @Post('links')
  createLink(@Body() payload: CreateContentCultureLinkDto) { return this.cultureExhibitsService.createLink(payload); }

  @Delete('links/:id')
  removeLink(@Param('id', ParseIntPipe) id: number) { return this.cultureExhibitsService.removeLink(id); }
}
