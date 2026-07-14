import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly configService;
    private readonly adminRepository;
    private readonly dictionaryRepository;
    private readonly phraseRepository;
    private readonly proverbRepository;
    private readonly songRepository;
    private readonly cultureExhibitRepository;
    private readonly cultureLinkRepository;
    private readonly logger;
    constructor(configService: ConfigService, adminRepository: Repository<Admin>, dictionaryRepository: Repository<DictionaryEntry>, phraseRepository: Repository<Phrase>, proverbRepository: Repository<Proverb>, songRepository: Repository<Song>, cultureExhibitRepository: Repository<CultureExhibit>, cultureLinkRepository: Repository<ContentCultureLink>);
    onApplicationBootstrap(): Promise<void>;
    private seedAdmin;
    private seedContent;
    private seedCultureExhibits;
}
