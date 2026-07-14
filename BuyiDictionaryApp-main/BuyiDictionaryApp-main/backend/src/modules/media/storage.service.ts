import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async upload(params: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<{ url: string; storageKey: string }> {
    const driver = this.configService.get<string>('media.driver', 'local');
    if (driver === 'cos') {
      const bucket = this.configService.get<string>('media.cosBucket', '');
      const secretId = this.configService.get<string>('media.cosSecretId', '');
      if (!bucket || !secretId) {
        return this.uploadToLocal(params);
      }
      return this.uploadToCos(params);
    }
    return this.uploadToLocal(params);
  }

  async delete(storageKey?: string | null): Promise<void> {
    if (!storageKey) {
      return;
    }

    const driver = this.configService.get<string>('media.driver', 'local');
    if (driver === 'cos') {
      await this.deleteFromCos(storageKey);
      return;
    }
    await this.deleteFromLocal(storageKey);
  }

  private async uploadToLocal(params: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<{ url: string; storageKey: string }> {
    const uploadDir = this.configService.get<string>('media.localUploadDir', 'uploads');
    const safeName = `${Date.now()}-${params.filename.replace(/[^\w.\-()\u4e00-\u9fa5]/g, '-')}`;
    const storageKey = safeName;
    const absoluteDir = join(process.cwd(), uploadDir);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(join(absoluteDir, storageKey), params.buffer);
    const baseUrl = this.configService.get<string>('media.publicBaseUrl', 'http://localhost:3000/uploads');
    return {
      storageKey,
      url: `${baseUrl.replace(/\/$/, '')}/${storageKey}`,
    };
  }

  private async deleteFromLocal(storageKey: string) {
    const uploadDir = this.configService.get<string>('media.localUploadDir', 'uploads');
    const absolutePath = join(process.cwd(), uploadDir, storageKey);
    try {
      await unlink(absolutePath);
    } catch {
      return;
    }
  }

  private async uploadToCos(params: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<{ url: string; storageKey: string }> {
    const cos = new COS({
      SecretId: this.configService.get<string>('media.cosSecretId', ''),
      SecretKey: this.configService.get<string>('media.cosSecretKey', ''),
    });
    const storageKey = `${Date.now()}-${params.filename.replace(/[^\w.\-()\u4e00-\u9fa5]/g, '-')}`;

    await new Promise<void>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: this.configService.get<string>('media.cosBucket', ''),
          Region: this.configService.get<string>('media.cosRegion', ''),
          Key: storageKey,
          Body: params.buffer,
          ContentType: params.mimeType,
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    }).catch(() => {
      throw new InternalServerErrorException('上传到对象存储失败');
    });

    const publicBaseUrl = this.configService.get<string>('media.cosPublicBaseUrl', '');
    const fallbackUrl = `https://${this.configService.get<string>('media.cosBucket', '')}.cos.${this.configService.get<string>(
      'media.cosRegion',
      '',
    )}.myqcloud.com/${storageKey}`;

    return {
      storageKey,
      url: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${storageKey}` : fallbackUrl,
    };
  }

  private async deleteFromCos(storageKey: string) {
    const cos = new COS({
      SecretId: this.configService.get<string>('media.cosSecretId', ''),
      SecretKey: this.configService.get<string>('media.cosSecretKey', ''),
    });

    await new Promise<void>((resolve, reject) => {
      cos.deleteObject(
        {
          Bucket: this.configService.get<string>('media.cosBucket', ''),
          Region: this.configService.get<string>('media.cosRegion', ''),
          Key: storageKey,
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    }).catch(() => {
      throw new InternalServerErrorException('从对象存储删除文件失败');
    });
  }
}
