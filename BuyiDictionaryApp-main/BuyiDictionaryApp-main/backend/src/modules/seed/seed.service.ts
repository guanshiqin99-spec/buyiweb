import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminRole } from '../../common/enums/admin-role.enum';
import { isProductionEnvironment } from '../../config/runtime-validation';
import { Admin } from '../../entities/admin.entity';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
import { ContentType } from '../../common/enums/content-type.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepository: Repository<DictionaryEntry>,
    @InjectRepository(Phrase)
    private readonly phraseRepository: Repository<Phrase>,
    @InjectRepository(Proverb)
    private readonly proverbRepository: Repository<Proverb>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(CultureExhibit)
    private readonly cultureExhibitRepository: Repository<CultureExhibit>,
    @InjectRepository(ContentCultureLink)
    private readonly cultureLinkRepository: Repository<ContentCultureLink>,
  ) {}

  onApplicationBootstrap() {
    const enabled = this.configService.get<boolean>('seed.onBoot', true);
    if (!enabled) {
      return;
    }

    this.seedAsync().catch(err => {
      this.logger.error('Seed failed:', err);
    });
  }

  private async seedAsync() {
    await this.seedAdmin();
    
    const hasContent = await Promise.all([
      this.dictionaryRepository.count(),
      this.phraseRepository.count(),
      this.proverbRepository.count(),
    ]).then(([d, p, pr]) => d > 0 || p > 0 || pr > 0);
    
    if (!hasContent) {
      await this.seedContent();
    }
    
    const hasExhibit = await this.cultureExhibitRepository.count();
    if (!hasExhibit) {
      await this.seedCultureExhibits();
    }
  }

  private async seedAdmin() {
    if (isProductionEnvironment(process.env)) {
      return;
    }

    const username = this.configService.get<string>('seed.adminUsername', 'admin');
    const existing = await this.adminRepository.findOne({ where: { username } });
    if (existing) {
      return;
    }

    const password = this.configService.get<string>('seed.adminPassword', 'Admin@123456');
    const passwordHash = await bcrypt.hash(password, 6);
    await this.adminRepository.save(
      this.adminRepository.create({
        username,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
      }),
    );
    this.logger.log(`Seeded default admin account: ${username}`);
  }

  private async seedContent() {
    if (isProductionEnvironment(process.env)) {
      return;
    }

    const dictionaries = [
      { buyiText: 'noi', zhText: '你好', zhSortKey: 'ni hao', enText: 'Hello', description: '基础问候语', isPublished: true, sortOrder: 1 },
      { buyiText: 'do', zhText: '爸爸', zhSortKey: 'ba ba', enText: 'Father', description: '亲属称呼', isPublished: true, sortOrder: 2 },
      { buyiText: 'mo', zhText: '妈妈', zhSortKey: 'ma ma', enText: 'Mother', description: '亲属称呼', isPublished: true, sortOrder: 3 },
    ];

    const phrases = [
      { buyiText: 'nang bux', zhText: '你好吗？', zhSortKey: 'ni hao ma', enText: 'How are you?', description: '日常问候', isPublished: true, sortOrder: 1 },
      { buyiText: 'yo bux', zhText: '我很好', zhSortKey: 'wo hen hao', enText: "I'm fine", description: '回答问候', isPublished: true, sortOrder: 2 },
    ];

    const proverbs = [
      { buyiText: 'nga zi ni ma', zhText: '说话像唱歌', zhSortKey: 'shuo hua xiang chang ge', enText: 'Speak like singing', description: '布依族文化表达', isPublished: true, sortOrder: 1 },
    ];

    await Promise.all([
      this.dictionaryRepository.save(dictionaries.map(d => this.dictionaryRepository.create(d))),
      this.phraseRepository.save(phrases.map(p => this.phraseRepository.create(p))),
      this.proverbRepository.save(proverbs.map(p => this.proverbRepository.create(p))),
    ]);
  }

  private async seedCultureExhibits() {
    if (isProductionEnvironment(process.env)) {
      return;
    }

    const exhibit = await this.cultureExhibitRepository.save(this.cultureExhibitRepository.create({
      slug: 'buyi-folk-song',
      title: '从“说话像唱歌”走进民歌声场',
      kicker: '由词入馆 · 声音展项',
      summary: '从一条带有歌唱意象的谚语出发，观察布依民歌的唱法与使用场景，并继续进入可播放的民歌声场。',
      story: '中国非物质文化遗产网介绍，布依族民歌有古歌、叙事歌、情歌、酒歌和劳动歌等类型，也有独唱、对唱、齐唱、重唱等演唱形式。本页的琴键只展示合成调值轮廓，不将其当作真实例词录音。',
      patternLabel: '声音与礼俗的线索',
      toneIndex: 1,
      isPublished: true,
      sortOrder: 1,
    }));

    const songs = [
      { title: '布依迎客歌', artist: '布依文化采集', buyiText: 'hau mbou', zhText: '欢迎远方客人的民歌', zhSortKey: 'huan ying yuan fang ke ren de min ge', enText: 'Welcome song of Buyi people', description: '首页轮播与民歌列表示例数据', isPublished: true, sortOrder: 1 },
      { title: '山歌对唱', artist: '黔南山歌队', buyiText: 'gaen hau', zhText: '山谷之间的对唱', zhSortKey: 'shan gu zhi jian de dui chang', enText: 'Valley antiphonal singing', description: '用于首页展示布依语韵律与文化气质', isPublished: true, sortOrder: 2 },
      { title: '田间节奏', artist: '布依青年合唱', buyiText: 'mbou ra', zhText: '田间劳作时的节奏民歌', zhSortKey: 'tian jian lao zuo shi de jie zou min ge', enText: 'Rhythm of farming folk song', description: '作为小程序首页精选民歌示例', isPublished: true, sortOrder: 3 },
    ];

    await this.songRepository.save(songs.map(s => this.songRepository.create(s)));

    const proverb = await this.proverbRepository.findOne({ where: { buyiText: 'nga zi ni ma' } });
    if (proverb) {
      await this.cultureLinkRepository.save(this.cultureLinkRepository.create({
        contentType: ContentType.PROVERB,
        contentId: proverb.id,
        exhibitId: exhibit.id,
        sortOrder: 1,
      }));
    }
  }
}