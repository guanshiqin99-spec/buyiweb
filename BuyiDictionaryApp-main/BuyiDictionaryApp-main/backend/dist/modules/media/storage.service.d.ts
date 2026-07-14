import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private readonly configService;
    constructor(configService: ConfigService);
    upload(params: {
        buffer: Buffer;
        filename: string;
        mimeType: string;
    }): Promise<{
        url: string;
        storageKey: string;
    }>;
    delete(storageKey?: string | null): Promise<void>;
    private uploadToLocal;
    private deleteFromLocal;
    private uploadToCos;
    private deleteFromCos;
}
