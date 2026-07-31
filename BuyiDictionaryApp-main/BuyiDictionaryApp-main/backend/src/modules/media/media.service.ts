import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { Repository } from 'typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { MediaAsset } from '../../entities/media-asset.entity';
import { Song } from '../../entities/song.entity';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UploadedMediaFile } from './media.types';
import { StorageService } from './storage.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaRepository: Repository<MediaAsset>,
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepository: Repository<DictionaryEntry>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async list() {
    return this.mediaRepository.find({ order: { id: 'DESC' } });
  }

  async upload(file: UploadedMediaFile | undefined, payload: UploadMediaDto) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }
    this.validateUpload(file, payload.kind);

    const uploaded = await this.storageService.upload({
      buffer: file.buffer,
      filename: this.normalizeFilename(payload.filename || file.originalname, payload.kind),
      mimeType: file.mimetype,
    });

    const asset = this.mediaRepository.create({
      kind: payload.kind,
      filename: this.normalizeFilename(payload.filename || file.originalname, payload.kind),
      url: uploaded.url,
      storageKey: uploaded.storageKey,
      mimeType: file.mimetype,
      size: file.size,
    });

    return this.mediaRepository.save(asset);
  }

  async remove(id: number) {
    const asset = await this.mediaRepository.findOne({ where: { id } });
    if (!asset) {
      throw new BadRequestException('媒体资源不存在');
    }

    const [dictionaryRefs, songRefs] = await Promise.all([
      this.dictionaryRepository.count({ where: { audioMediaId: id } }),
      this.songRepository.count({
        where: [{ coverMediaId: id }, { audioMediaId: id }],
      }),
    ]);

    if (dictionaryRefs > 0 || songRefs > 0) {
      throw new BadRequestException('该媒体资源仍被内容引用，不能删除');
    }

    await this.storageService.delete(asset.storageKey);
    await this.mediaRepository.remove(asset);
    return { success: true };
  }

  private validateUpload(file: UploadedMediaFile, kind: 'image' | 'audio') {
    const maxFileSize = this.configService.get<number>('media.maxFileSize', 10 * 1024 * 1024);
    if (file.size > maxFileSize) {
      throw new BadRequestException(`文件大小不能超过 ${Math.floor(maxFileSize / 1024 / 1024)}MB`);
    }

    const extension = extname(file.originalname || '');
    if (!extension) {
      throw new BadRequestException('上传文件必须包含合法扩展名');
    }

    const mimeWhiteList =
      kind === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        : ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg'];

    if (!mimeWhiteList.includes(file.mimetype)) {
      throw new BadRequestException(kind === 'image' ? '图片文件格式不受支持' : '音频文件格式不受支持');
    }
  }

  // 安全：按 kind 限定允许的扩展名白名单，与 MIME 白名单保持一致，
  // 阻止用 image/png 的 MIME 配 .html 扩展名落盘后被静态服务当 HTML 解析的存储型 XSS
  private static readonly ALLOWED_EXTENSIONS: Record<'image' | 'audio', string[]> = {
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
  };

  private normalizeFilename(filename: string, kind: 'image' | 'audio') {
    const value = String(filename || '').trim();
    if (!value) {
      throw new BadRequestException('文件名不能为空');
    }
    if (!/^[\w.\-()\u4e00-\u9fa5\s]+$/.test(value)) {
      throw new BadRequestException('文件名包含非法字符');
    }
    const ext = extname(value).toLowerCase();
    if (!ext) {
      throw new BadRequestException('文件名必须包含扩展名');
    }
    const allowed = MediaService.ALLOWED_EXTENSIONS[kind];
    if (!allowed.includes(ext)) {
      throw new BadRequestException(`文件扩展名 ${ext} 与上传类型 ${kind} 不匹配`);
    }
    return value.replace(/\s+/g, '-');
  }
}
