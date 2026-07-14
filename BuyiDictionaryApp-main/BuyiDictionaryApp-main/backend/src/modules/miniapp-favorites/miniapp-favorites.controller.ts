import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { MiniappFavoritesService } from './miniapp-favorites.service';

@Controller('miniapp/favorites')
@UseGuards(MiniappJwtGuard)
export class MiniappFavoritesController {
  constructor(private readonly favoritesService: MiniappFavoritesService) {}

  @Get()
  list(@CurrentUser() user: { sub: number }) {
    return this.favoritesService.list(user.sub);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: { sub: number }, @Body() payload: ToggleFavoriteDto) {
    return this.favoritesService.toggle(user.sub, payload.contentType, payload.contentId);
  }

  @Delete()
  clear(@CurrentUser() user: { sub: number }) {
    return this.favoritesService.clear(user.sub);
  }
}
