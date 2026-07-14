export declare class BaseAdminContentDto {
    buyiText: string;
    zhText: string;
    enText?: string;
    description?: string;
    isPublished?: boolean;
    sortOrder?: number;
}
declare const UpdateBaseAdminContentDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseAdminContentDto>>;
export declare class UpdateBaseAdminContentDto extends UpdateBaseAdminContentDto_base {
}
export declare class DictionaryAdminDto extends BaseAdminContentDto {
    audioUrl?: string;
    audioMediaId?: number;
}
declare const UpdateDictionaryAdminDto_base: import("@nestjs/mapped-types").MappedType<Partial<DictionaryAdminDto>>;
export declare class UpdateDictionaryAdminDto extends UpdateDictionaryAdminDto_base {
}
export declare class SongAdminDto extends BaseAdminContentDto {
    title: string;
    artist?: string;
    coverUrl?: string;
    audioUrl?: string;
    coverMediaId?: number;
    audioMediaId?: number;
}
declare const UpdateSongAdminDto_base: import("@nestjs/mapped-types").MappedType<Partial<SongAdminDto>>;
export declare class UpdateSongAdminDto extends UpdateSongAdminDto_base {
}
export {};
