import { MediaService } from '../media/media.service';
import { UploadMediaDto } from '../media/dto/upload-media.dto';
import { UploadedMediaFile } from '../media/media.types';
export declare class AdminMediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    list(): Promise<import("../../entities/media-asset.entity").MediaAsset[]>;
    upload(file: UploadedMediaFile, payload: UploadMediaDto): Promise<import("../../entities/media-asset.entity").MediaAsset>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
