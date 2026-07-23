import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class BaseAdminContentDto {
  @IsString()
  @MaxLength(255)
  buyiText!: string;

  @IsString()
  @MaxLength(255)
  zhText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  enText?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  culturalNote?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateBaseAdminContentDto extends PartialType(BaseAdminContentDto) {}

export class DictionaryAdminDto extends BaseAdminContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @IsOptional()
  @IsInt()
  audioMediaId?: number;
}

export class UpdateDictionaryAdminDto extends PartialType(DictionaryAdminDto) {}

export class SongAdminDto extends BaseAdminContentDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsInt()
  coverMediaId?: number;

  @IsOptional()
  @IsInt()
  audioMediaId?: number;
}

export class UpdateSongAdminDto extends PartialType(SongAdminDto) {}
