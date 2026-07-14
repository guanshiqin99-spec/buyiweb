import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { MediaAsset } from '../../entities/media-asset.entity';
import { Song } from '../../entities/song.entity';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UploadedMediaFile } from './media.types';
import { StorageService } from './storage.service';
export declare class MediaService {
    private readonly mediaRepository;
    private readonly dictionaryRepository;
    private readonly songRepository;
    private readonly storageService;
    private readonly configService;
    constructor(mediaRepository: Repository<MediaAsset>, dictionaryRepository: Repository<DictionaryEntry>, songRepository: Repository<Song>, storageService: StorageService, configService: ConfigService);
    list(): Promise<MediaAsset[]>;
    upload(file: UploadedMediaFile | undefined, payload: UploadMediaDto): Promise<MediaAsset>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    private validateUpload;
    private normalizeFilename;
}
