import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { Favorite } from '../../entities/favorite.entity';
import { ContentService } from '../content/content.service';

@Injectable()
export class MiniappFavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly contentService: ContentService,
  ) {}

  async getFavoriteMap(userId: number) {
    const favorites = await this.favoriteRepository.find({ where: { userId } });
    return new Set(favorites.map((item) => `${item.contentType}:${item.contentId}`));
  }

  async list(userId: number) {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      order: { id: 'DESC' },
    });

    const grouped = favorites.reduce<Record<string, number[]>>((acc, current) => {
      acc[current.contentType] = acc[current.contentType] || [];
      acc[current.contentType].push(current.contentId);
      return acc;
    }, {});

    const [dictionary, phrases, proverbs, songs] = await Promise.all([
      this.contentService.getByIds(ContentType.DICTIONARY, grouped[ContentType.DICTIONARY] ?? []),
      this.contentService.getByIds(ContentType.PHRASE, grouped[ContentType.PHRASE] ?? []),
      this.contentService.getByIds(ContentType.PROVERB, grouped[ContentType.PROVERB] ?? []),
      this.contentService.getByIds(ContentType.SONG, grouped[ContentType.SONG] ?? []),
    ]);

    return {
      dictionary: dictionary.map((item) => ({ ...this.contentService.serialize(item, ContentType.DICTIONARY), isFavorited: true })),
      phrases: phrases.map((item) => ({ ...this.contentService.serialize(item, ContentType.PHRASE), isFavorited: true })),
      proverbs: proverbs.map((item) => ({ ...this.contentService.serialize(item, ContentType.PROVERB), isFavorited: true })),
      songs: songs.map((item) => ({ ...this.contentService.serialize(item, ContentType.SONG), isFavorited: true })),
    };
  }

  async toggle(userId: number, contentType: ContentType, contentId: number) {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, contentType, contentId },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { isFavorited: false };
    }

    await this.favoriteRepository.save(
      this.favoriteRepository.create({
        userId,
        contentType,
        contentId,
      }),
    );
    return { isFavorited: true };
  }

  async clear(userId: number) {
    const result = await this.favoriteRepository.delete({ userId });
    return {
      success: true,
      deletedCount: result.affected ?? 0,
      message: '\u5df2\u6e05\u7a7a\u6536\u85cf',
    };
  }

  async annotate<T extends { id: number }>(userId: number, contentType: ContentType, items: T[]) {
    if (!items.length) {
      return [];
    }
    const favorites = await this.favoriteRepository.find({
      where: {
        userId,
        contentType,
        contentId: In(items.map((item) => item.id)),
      },
    });
    const favoriteIds = new Set(favorites.map((item) => item.contentId));
    return items.map((item) => ({ ...item, isFavorited: favoriteIds.has(item.id) }));
  }
}
