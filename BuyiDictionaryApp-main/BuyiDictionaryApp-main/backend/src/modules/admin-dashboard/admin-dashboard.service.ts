import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepository: Repository<DictionaryEntry>,
    @InjectRepository(Phrase)
    private readonly phraseRepository: Repository<Phrase>,
    @InjectRepository(Proverb)
    private readonly proverbRepository: Repository<Proverb>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(LearningRecord)
    private readonly learningRecordRepository: Repository<LearningRecord>,
  ) {}

  async getSummary() {
    const [users, dictionary, phrases, proverbs, songs, favorites, learningRecords] = await Promise.all([
      this.userRepository.count(),
      this.dictionaryRepository.count(),
      this.phraseRepository.count(),
      this.proverbRepository.count(),
      this.songRepository.count(),
      this.favoriteRepository.count(),
      this.learningRecordRepository.count(),
    ]);

    // 统计各类型未发布数量
    const [
      dictionaryUnpublished,
      phrasesUnpublished,
      proverbsUnpublished,
      songsUnpublished,
    ] = await Promise.all([
      this.dictionaryRepository.count({ where: { isPublished: false } }),
      this.phraseRepository.count({ where: { isPublished: false } }),
      this.proverbRepository.count({ where: { isPublished: false } }),
      this.songRepository.count({ where: { isPublished: false } }),
    ]);

    const totalUnpublished =
      dictionaryUnpublished + phrasesUnpublished + proverbsUnpublished + songsUnpublished;

    return {
      users,
      content: {
        dictionary,
        phrases,
        proverbs,
        songs,
        total: dictionary + phrases + proverbs + songs,
      },
      unpublished: {
        dictionary: dictionaryUnpublished,
        phrases: phrasesUnpublished,
        proverbs: proverbsUnpublished,
        songs: songsUnpublished,
        total: totalUnpublished,
      },
      favorites,
      learningRecords,
    };
  }

  /** 一键发布所有待发布内容（将 isPublished 设为 true） */
  async batchPublishAll() {
    const results = await Promise.all([
      this.dictionaryRepository
        .createQueryBuilder()
        .update()
        .set({ isPublished: true })
        .where('isPublished = :val', { val: false })
        .execute(),
      this.phraseRepository
        .createQueryBuilder()
        .update()
        .set({ isPublished: true })
        .where('isPublished = :val', { val: false })
        .execute(),
      this.proverbRepository
        .createQueryBuilder()
        .update()
        .set({ isPublished: true })
        .where('isPublished = :val', { val: false })
        .execute(),
      this.songRepository
        .createQueryBuilder()
        .update()
        .set({ isPublished: true })
        .where('isPublished = :val', { val: false })
        .execute(),
    ]);

    const affected = {
      dictionary: results[0].affected ?? 0,
      phrases: results[1].affected ?? 0,
      proverbs: results[2].affected ?? 0,
      songs: results[3].affected ?? 0,
      total: results.reduce((sum, r) => sum + (r.affected ?? 0), 0),
    };

    return { success: true, affected };
  }
}
