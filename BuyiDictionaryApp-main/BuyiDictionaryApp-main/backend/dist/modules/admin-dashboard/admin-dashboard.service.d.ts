import { Repository } from 'typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { User } from '../../entities/user.entity';
export declare class AdminDashboardService {
    private readonly userRepository;
    private readonly dictionaryRepository;
    private readonly phraseRepository;
    private readonly proverbRepository;
    private readonly songRepository;
    private readonly favoriteRepository;
    private readonly learningRecordRepository;
    constructor(userRepository: Repository<User>, dictionaryRepository: Repository<DictionaryEntry>, phraseRepository: Repository<Phrase>, proverbRepository: Repository<Proverb>, songRepository: Repository<Song>, favoriteRepository: Repository<Favorite>, learningRecordRepository: Repository<LearningRecord>);
    getSummary(): Promise<{
        users: number;
        content: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
        unpublished: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
        favorites: number;
        learningRecords: number;
    }>;
    batchPublishAll(): Promise<{
        success: boolean;
        affected: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
    }>;
}
